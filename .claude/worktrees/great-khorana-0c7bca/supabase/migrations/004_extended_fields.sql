-- =====================================================
-- MSN Products — Tarea 2: campos extendidos (long_description + specs)
-- =====================================================
-- Correr en el SQL Editor de Supabase. Idempotente.
-- =====================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS long_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS specs JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Índice GIN por si en el futuro queremos filtrar por specs
CREATE INDEX IF NOT EXISTS idx_products_specs ON products USING GIN (specs);
