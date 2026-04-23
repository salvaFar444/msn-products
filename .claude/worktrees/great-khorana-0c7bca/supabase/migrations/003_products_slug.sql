-- =====================================================
-- MSN Products — Tarea 2: slugs por producto
-- =====================================================
-- Correr en el SQL Editor de Supabase. Idempotente.
-- =====================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;

-- ─── Función de generación de slugs ──────────────────
-- kebab-case, sin tildes, sin caracteres especiales.
CREATE OR REPLACE FUNCTION generate_slug(input TEXT) RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  -- 1) reemplazar acentos
  result := translate(
    input,
    'áéíóúüÁÉÍÓÚÜñÑ',
    'aeiouuAEIOUUnN'
  );
  -- 2) a lowercase
  result := lower(result);
  -- 3) eliminar cualquier cosa que no sea alfanumérico, espacio o guion
  result := regexp_replace(result, '[^a-z0-9\s-]', '', 'g');
  -- 4) colapsar espacios y guiones
  result := regexp_replace(result, '[\s-]+', '-', 'g');
  -- 5) trim guiones de inicio/fin
  result := trim(both '-' from result);
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─── Rellenar slugs faltantes (idempotente) ──────────
-- Evita colisiones añadiendo los primeros 8 caracteres del id si hay choque.
UPDATE products
SET slug = generate_slug(name) || '-' || substr(id::text, 1, 8)
WHERE slug IS NULL
  AND EXISTS (
    SELECT 1 FROM products p2
    WHERE p2.id != products.id
      AND generate_slug(p2.name) = generate_slug(products.name)
  );

UPDATE products
SET slug = generate_slug(name)
WHERE slug IS NULL;

-- Ahora sí: unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_slug_unique'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_slug_unique UNIQUE (slug);
  END IF;
END$$;

-- ─── Trigger para auto-generar slug al insertar ──────
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  candidate TEXT;
  counter   INTEGER := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_slug(NEW.name);
    candidate := base_slug;
    -- Si ya existe, añade -2, -3, etc.
    WHILE EXISTS (
      SELECT 1 FROM products WHERE slug = candidate AND id != NEW.id
    ) LOOP
      counter := counter + 1;
      candidate := base_slug || '-' || (counter + 1);
    END LOOP;
    NEW.slug := candidate;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_auto_slug ON products;
CREATE TRIGGER products_auto_slug
  BEFORE INSERT OR UPDATE OF name ON products
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_slug();

-- Índice para búsquedas rápidas por slug
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
