-- =====================================================
-- MSN Products — Tarea 1: tabla product_media + bucket product-videos
-- =====================================================
-- Correr en el SQL Editor de Supabase. Idempotente.
-- =====================================================

-- ─── product_media ───────────────────────────────────
CREATE TABLE IF NOT EXISTS product_media (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  media_type  TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  position    INTEGER NOT NULL DEFAULT 0,
  is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_media_product_id
  ON product_media(product_id);

CREATE INDEX IF NOT EXISTS idx_product_media_primary
  ON product_media(product_id, is_primary);

-- Only one primary per product
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_primary_per_product
  ON product_media(product_id) WHERE is_primary = TRUE;

-- RLS: public read, writes via service role
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_media_public_read" ON product_media;
CREATE POLICY "product_media_public_read"
  ON product_media FOR SELECT
  USING (true);

-- ─── Backfill from products.image_url ────────────────
-- Copia la imagen actual de cada producto como media principal,
-- SOLO si el producto todavía no tiene ninguna media registrada.
INSERT INTO product_media (product_id, url, media_type, position, is_primary)
SELECT p.id, p.image_url, 'image', 0, TRUE
FROM products p
LEFT JOIN product_media pm ON pm.product_id = p.id
WHERE p.image_url IS NOT NULL
  AND p.image_url != ''
  AND pm.id IS NULL;

-- ─── Storage bucket: product-videos ──────────────────
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

DROP POLICY IF EXISTS "product_videos_public_read" ON storage.objects;
CREATE POLICY "product_videos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-videos');
