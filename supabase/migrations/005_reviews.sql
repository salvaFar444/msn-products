-- =====================================================
-- MSN Products — Tarea 2: product_reviews
-- =====================================================
-- Correr en el SQL Editor de Supabase. Idempotente.
-- =====================================================

CREATE TABLE IF NOT EXISTS product_reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  author_name  TEXT NOT NULL,
  author_city  TEXT,
  rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT NOT NULL,
  is_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON product_reviews(created_at DESC);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_public_read" ON product_reviews;
CREATE POLICY "reviews_public_read"
  ON product_reviews FOR SELECT
  USING (true);
