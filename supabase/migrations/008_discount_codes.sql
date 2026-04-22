-- ============================================================
-- 008 — Discount codes
-- ============================================================

CREATE TABLE IF NOT EXISTS public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(12, 2) NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (min_order_amount >= 0),
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON public.discount_codes (code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON public.discount_codes (is_active) WHERE is_active = true;

-- Normalize code to uppercase/trim before insert/update
CREATE OR REPLACE FUNCTION public.normalize_discount_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.code = UPPER(TRIM(NEW.code));
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_normalize_discount_code ON public.discount_codes;
CREATE TRIGGER trg_normalize_discount_code
  BEFORE INSERT OR UPDATE ON public.discount_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_discount_code();

-- RLS — public can read only active, non-expired codes (for client-side preview)
-- Admin writes go through service_role which bypasses RLS
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active_discount_codes" ON public.discount_codes;
CREATE POLICY "public_read_active_discount_codes"
  ON public.discount_codes
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (starts_at IS NULL OR starts_at <= NOW())
  );

NOTIFY pgrst, 'reload schema';
