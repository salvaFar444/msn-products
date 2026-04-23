-- =====================================================
-- MSN Products — ALL-IN-ONE: habilitar múltiples imágenes + videos
-- =====================================================
-- Esta migración consolida TODO lo que necesitas para que la galería
-- multimedia (varias fotos + videos) funcione en producción.
--
-- COPIA TODO ESTE ARCHIVO → pégalo en el SQL Editor de Supabase → Run.
-- Es 100% idempotente: puedes ejecutarlo varias veces sin romper nada.
-- No borra datos existentes.
-- =====================================================

-- ─── 1) Asegurar columnas extendidas en products ─────────────────
--    (long_description + specs para la ficha tipo Mercado Libre)
ALTER TABLE products ADD COLUMN IF NOT EXISTS long_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS specs JSONB NOT NULL DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_products_specs ON products USING GIN (specs);

-- ─── 2) Slug único para URLs amigables (/producto/audifonos-pro) ─
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug_unique
  ON products(slug) WHERE slug IS NOT NULL;

-- Auto-generar slug desde name si está vacío (función + trigger)
CREATE OR REPLACE FUNCTION public.auto_generate_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  IF NEW.slug IS NOT NULL AND NEW.slug != '' THEN
    RETURN NEW;
  END IF;

  -- lowercase + reemplazar no-alfanum por guiones + colapsar guiones
  base_slug := regexp_replace(lower(trim(NEW.name)), '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  IF base_slug = '' THEN
    base_slug := 'producto';
  END IF;

  final_slug := base_slug;
  WHILE EXISTS (
    SELECT 1 FROM products
    WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_generate_slug ON products;
CREATE TRIGGER trg_auto_generate_slug
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION public.auto_generate_slug();

-- ─── 3) Tabla product_media (múltiples imágenes/videos) ──────────
CREATE TABLE IF NOT EXISTS product_media (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  media_type  TEXT NOT NULL DEFAULT 'image',
  position    INTEGER NOT NULL DEFAULT 0,
  is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Normalizar columna legacy `type` → `media_type` si existía así
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_media' AND column_name = 'type'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_media' AND column_name = 'media_type'
  ) THEN
    ALTER TABLE product_media RENAME COLUMN type TO media_type;
  END IF;
END $$;

-- Si la tabla ya existía pero sin columnas nuevas, agregarlas
ALTER TABLE product_media ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'image';
ALTER TABLE product_media ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_media ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT FALSE;

-- CHECK constraint en media_type (image|video)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_media_media_type_check'
  ) THEN
    ALTER TABLE product_media
      ADD CONSTRAINT product_media_media_type_check
      CHECK (media_type IN ('image', 'video'));
  END IF;
END $$;

-- Índices
CREATE INDEX IF NOT EXISTS idx_product_media_product_id ON product_media(product_id);
CREATE INDEX IF NOT EXISTS idx_product_media_primary ON product_media(product_id, is_primary);
-- Solo una imagen principal por producto
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_primary_per_product
  ON product_media(product_id) WHERE is_primary = TRUE;

-- ─── 4) RLS: lectura pública, escritura solo por service role ────
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_media_public_read" ON product_media;
CREATE POLICY "product_media_public_read" ON product_media
  FOR SELECT USING (true);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (true);

-- ─── 5) Backfill: copiar image_url existente como media principal ─
INSERT INTO product_media (product_id, url, media_type, position, is_primary)
SELECT p.id, p.image_url, 'image', 0, TRUE
FROM products p
LEFT JOIN product_media pm ON pm.product_id = p.id
WHERE p.image_url IS NOT NULL
  AND p.image_url != ''
  AND p.image_url != '/img.jpg'
  AND pm.id IS NULL;

-- Asegurar que cada producto con imágenes tenga al menos una primary
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

-- ─── 6) Bucket de imágenes (5MB, JPG/PNG/WebP) ───────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ─── 7) Bucket de videos (20MB, MP4/WebM) ────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-videos',
  'product-videos',
  true,
  20971520, -- 20 MB
  ARRAY['video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ─── 8) Policies de Storage para ambos buckets ───────────────────
DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
CREATE POLICY "product_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_videos_public_read" ON storage.objects;
CREATE POLICY "product_videos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-videos');

-- ─── 9) Backfill slugs para productos sin slug ───────────────────
UPDATE products
SET slug = NULL
WHERE slug = '';

UPDATE products p
SET slug = NULL
WHERE slug IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM products p2
    WHERE p2.slug = p.slug AND p2.id < p.id
  );

-- Forzar trigger para generar slugs faltantes
UPDATE products SET name = name WHERE slug IS NULL;

-- ─── 10) Verificación final ─────────────────────────────────────
DO $$
DECLARE
  products_cols INTEGER;
  media_cols INTEGER;
  buckets_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO products_cols
  FROM information_schema.columns
  WHERE table_name = 'products'
    AND column_name IN ('long_description', 'specs', 'slug');

  SELECT COUNT(*) INTO media_cols
  FROM information_schema.columns
  WHERE table_name = 'product_media'
    AND column_name IN ('media_type', 'position', 'is_primary');

  SELECT COUNT(*) INTO buckets_count
  FROM storage.buckets
  WHERE id IN ('product-images', 'product-videos');

  RAISE NOTICE '[007] products_cols=%/3 media_cols=%/3 buckets=%/2', products_cols, media_cols, buckets_count;
  IF products_cols = 3 AND media_cols = 3 AND buckets_count = 2 THEN
    RAISE NOTICE '[007] ✅ Migración completa. Ya puedes subir varias fotos y videos.';
  ELSE
    RAISE WARNING '[007] ⚠️  Algo quedó pendiente. Revisa los conteos arriba.';
  END IF;
END $$;

-- Forzar refresh del schema cache de PostgREST
NOTIFY pgrst, 'reload schema';
