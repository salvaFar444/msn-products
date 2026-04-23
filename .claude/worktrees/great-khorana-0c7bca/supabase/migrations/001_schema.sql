-- =====================================================
-- MSN Products — Schema (SOLO estructura)
-- =====================================================
-- ⚠️  REGLA DE ORO: este archivo JAMÁS debe contener INSERT, DELETE, TRUNCATE.
-- Solo CREATE TABLE IF NOT EXISTS, CREATE INDEX, FUNCTIONS, TRIGGERS, RLS.
-- Los datos iniciales van en supabase/seeds/*.sql y se ejecutan UNA VEZ manualmente.
--
-- Correr en el SQL Editor de Supabase. Es idempotente — re-ejecutarlo no daña datos.
-- =====================================================

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Products ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  short_name  TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('Audio', 'Wearables', 'Cables', 'Cargadores')),
  price       INTEGER NOT NULL CHECK (price > 0),
  description TEXT,
  image_url   TEXT DEFAULT '/img.jpg',
  badge       TEXT,
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  features    TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Guarantee that the same product name is never stored twice
-- (prevents future "schema.sql re-run" duplication).
-- This is wrapped in a DO block because adding an already-existing constraint errors.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_name_unique'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_name_unique UNIQUE (name);
  END IF;
END$$;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─── Row Level Security ──────────────────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read"
  ON products FOR SELECT
  USING (true);

-- Writes (INSERT/UPDATE/DELETE) require service role key, which bypasses RLS.

-- ─── Admin Users ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,   -- BCrypt hash
  role        TEXT DEFAULT 'admin',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
-- No public policy. Only service role reads this.

-- ─── Storage: product-images bucket ──────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
CREATE POLICY "product_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');
