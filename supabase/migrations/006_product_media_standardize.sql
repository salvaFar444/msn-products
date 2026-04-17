-- =====================================================
-- MSN Products — Fix crear producto: estandarizar schema
-- =====================================================
-- Contexto: la migración 002 usa CREATE TABLE IF NOT EXISTS, que NO
-- sincroniza columnas cuando la tabla ya existía con un schema viejo.
-- En producción product_media tiene `type` en vez de `media_type` y le
-- faltan `position` + `is_primary`. Eso hace que cualquier INSERT con
-- el nuevo schema falle con 42703 (column does not exist) y el admin
-- vea "No se pudo crear el producto" sin más detalle.
--
-- Esta migración es 100% idempotente: se puede correr varias veces sin
-- romper nada. Ejecutar en el SQL Editor de Supabase.
-- =====================================================

-- ─── 1) Normalizar columna `type` → `media_type` ─────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_media' AND column_name = 'type'
  )
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_media' AND column_name = 'media_type'
  )
  THEN
    ALTER TABLE product_media RENAME COLUMN type TO media_type;
  END IF;
END $$;

-- ─── 2) Agregar media_type si falta por completo ─────────────────
ALTER TABLE product_media
  ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'image';

-- Asegurar CHECK constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'product_media_media_type_check'
  ) THEN
    ALTER TABLE product_media
      ADD CONSTRAINT product_media_media_type_check
      CHECK (media_type IN ('image', 'video'));
  END IF;
END $$;

-- ─── 3) Agregar position si falta ────────────────────────────────
ALTER TABLE product_media
  ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0;

-- ─── 4) Agregar is_primary si falta ──────────────────────────────
ALTER TABLE product_media
  ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT FALSE;

-- ─── 5) Backfill positions secuenciales por producto ─────────────
-- Para productos que ya tenían filas con position=0 en todas, numerar
-- 0..n-1 por orden de created_at. Solo si todas son 0 (evita sobrescribir
-- un orden ya válido).
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY created_at ASC) - 1 AS new_pos,
    product_id
  FROM product_media
),
products_needing_backfill AS (
  SELECT product_id
  FROM product_media
  GROUP BY product_id
  HAVING COUNT(DISTINCT position) = 1 AND COUNT(*) > 1
)
UPDATE product_media pm
SET position = r.new_pos
FROM ranked r
WHERE pm.id = r.id
  AND pm.product_id IN (SELECT product_id FROM products_needing_backfill);

-- ─── 6) Backfill is_primary: la primera imagen (menor position) ──
WITH first_image AS (
  SELECT DISTINCT ON (product_id) id, product_id
  FROM product_media
  WHERE media_type = 'image'
  ORDER BY product_id, position ASC, created_at ASC
)
UPDATE product_media pm
SET is_primary = TRUE
FROM first_image fi
WHERE pm.id = fi.id
  AND NOT EXISTS (
    SELECT 1 FROM product_media p2
    WHERE p2.product_id = pm.product_id AND p2.is_primary = TRUE
  );

-- ─── 7) Índices ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_product_media_product_id
  ON product_media(product_id);

CREATE INDEX IF NOT EXISTS idx_product_media_primary
  ON product_media(product_id, is_primary);

-- Solo una primaria por producto.
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_primary_per_product
  ON product_media(product_id) WHERE is_primary = TRUE;

-- ─── 8) RLS: lectura pública ─────────────────────────────────────
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_media_public_read" ON product_media;
CREATE POLICY "product_media_public_read"
  ON product_media FOR SELECT
  USING (true);

-- NOTA sobre escrituras:
-- No creamos policies de INSERT/UPDATE/DELETE para `anon` o `authenticated`.
-- Todas las escrituras van por la API desde el servidor (Next.js route
-- handlers / server actions) usando SUPABASE_SERVICE_ROLE_KEY, que bypasea
-- RLS. Si ves errores "row-level security policy", verifica:
--   1. Que SUPABASE_SERVICE_ROLE_KEY esté en las env vars de Vercel.
--   2. Que lib/supabase-server.ts esté siendo usado (NO lib/supabase.ts)
--      en cualquier código que haga INSERT/UPDATE/DELETE.

-- ─── 9) RLS en products (defensa en profundidad) ────────────────
-- Igual que product_media: lectura pública, escrituras por service role.
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read"
  ON products FOR SELECT
  USING (true);

-- ─── 10) Verificación final ─────────────────────────────────────
-- Log un resumen útil en los logs del SQL Editor.
DO $$
DECLARE
  col_count INTEGER;
  idx_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_name = 'product_media'
    AND column_name IN ('id', 'product_id', 'url', 'media_type', 'position', 'is_primary', 'created_at');

  SELECT COUNT(*) INTO idx_count
  FROM pg_indexes
  WHERE tablename = 'product_media'
    AND indexname IN ('idx_product_media_product_id', 'idx_product_media_primary', 'idx_one_primary_per_product');

  RAISE NOTICE '[006_product_media_standardize] columns=% (expected 7) indexes=% (expected 3)', col_count, idx_count;
END $$;
