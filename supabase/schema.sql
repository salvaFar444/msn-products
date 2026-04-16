-- =====================================================
-- MSN Products — Supabase Schema
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Products Table ───────────────────────────────
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

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─── Row Level Security ──────────────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public: anyone can read products
CREATE POLICY "products_public_read"
  ON products FOR SELECT
  USING (true);

-- Only service role (admin) can write (INSERT/UPDATE/DELETE)
-- This is enforced by the service role key bypassing RLS — no extra policy needed.

-- ─── Admin Users Table ──────────────────────────
-- Used by Auth.js CredentialsProvider
CREATE TABLE IF NOT EXISTS admin_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,   -- BCrypt hash
  role        TEXT DEFAULT 'admin',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- No public access to admin_users (service role only)

-- ─── Storage Bucket ──────────────────────────────
-- Run in Supabase dashboard → Storage, or via this SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read policy for product-images bucket
CREATE POLICY "product_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- ─── Seed Initial Products ───────────────────────
INSERT INTO products (name, short_name, category, price, description, image_url, badge, stock, features) VALUES
(
  'Smartwatch Deportivo con Sensor Cardíaco',
  'Smartwatch Deportivo',
  'Wearables',
  150000,
  'Smartwatch con monitoreo de salud avanzado y conectividad con tu smartphone.',
  '/img.jpg',
  'Más vendido',
  10,
  ARRAY['Monitoreo de frecuencia cardíaca', 'GPS integrado', 'Resistente al agua', 'Batería de 18 horas', 'Detección de caídas']
),
(
  'Audífonos Inalámbricos Pro con Cancelación de Ruido',
  'Audífonos Pro',
  'Audio',
  65000,
  'Cancelación activa de ruido mejorada con audio espacial personalizado.',
  '/img.jpg',
  NULL,
  15,
  ARRAY['Cancelación activa de ruido', 'Audio espacial personalizado', 'Resistencia al agua IPX4', 'Hasta 6h reproducción', 'Estuche con carga inalámbrica']
),
(
  'Audífonos Inalámbricos Pro 3ra Generación',
  'Audífonos Pro 3',
  'Audio',
  75000,
  'La evolución definitiva de nuestros audífonos Pro con sonido de siguiente nivel.',
  '/img.jpg',
  'Nuevo',
  12,
  ARRAY['Chip mejorado', 'ANC de clase mundial', 'Audio sin pérdidas (via cable)', 'Hasta 7h reproducción', 'Estuche USB-C']
),
(
  'Audífonos Inalámbricos Básicos con Estuche de Carga',
  'Audífonos Básicos',
  'Audio',
  75000,
  'Los audífonos más cómodos con diseño renovado y audio de alta calidad.',
  '/img.jpg',
  NULL,
  8,
  ARRAY['Nuevo diseño ergonómico', 'Audio adaptativo', 'Estuche de carga', 'Hasta 5h reproducción', 'Carga inalámbrica']
),
(
  'Cable USB-C a USB-C',
  'Cable USB-C',
  'Cables',
  50000,
  'Cable de carga rápida trenzado, compatible con todos tus dispositivos USB-C.',
  '/img.jpg',
  NULL,
  30,
  ARRAY['Carga rápida 60W', 'Transferencia de datos 480 Mbps', 'Nylon trenzado resistente', '1 metro de largo', 'Compatible con carga magnética']
),
(
  'Cargador USB-C 20W de Carga Rápida',
  'Cargador USB-C 20W',
  'Cargadores',
  60000,
  'Adaptador de carga rápida USB-C de 20W, compacto y universal.',
  '/img.jpg',
  NULL,
  20,
  ARRAY['20W de potencia', 'Carga rápida universal', 'Compacto y liviano', 'Compatible con laptops ligeras', 'Certificado de seguridad']
),
(
  'Audífonos Over-Ear Inalámbricos Premium',
  'Over-Ear Premium',
  'Audio',
  150000,
  'Over-ear de primera clase con cancelación de ruido premium y audio envolvente.',
  '/img.jpg',
  'Premium',
  5,
  ARRAY['Cancelación de ruido líder', 'Audio espacial envolvente', 'Control de volumen rotatorio', '20h de batería', 'Diadema de malla transpirable']
);
