-- =========================================================================
-- MSN Products — Migration 001
-- Remove all Apple brand references from the products table.
--
-- WHY: The store no longer markets Apple products directly; product names
-- are now generic (compatible / universal wording) to avoid brand
-- infringement and broaden audience.
--
-- HOW TO RUN (Supabase SQL editor):
--   1. Back up the `products` table first (Export -> CSV).
--   2. Paste this file into the SQL editor and execute.
--   3. Verify with the final SELECT at the bottom.
--
-- This script is idempotent: re-running it will simply replace Apple-named
-- rows with their generic equivalents (no duplicates created).
-- =========================================================================

BEGIN;

-- -------------------------------------------------------------------------
-- 1. Rename AirPods-family products
-- -------------------------------------------------------------------------
UPDATE products
SET
  name        = 'Audífonos Inalámbricos Pro con Cancelación de Ruido',
  description = REGEXP_REPLACE(
    COALESCE(description, ''),
    '(AirPods\s*Pro|AirPods)',
    'audífonos inalámbricos',
    'gi'
  )
WHERE name ILIKE '%airpods%pro%' OR name ILIKE '%airpods pro 2%';

UPDATE products
SET
  name        = 'Audífonos Inalámbricos Básicos con Estuche de Carga',
  description = REGEXP_REPLACE(
    COALESCE(description, ''),
    '(AirPods)',
    'audífonos inalámbricos',
    'gi'
  )
WHERE name ILIKE '%airpods%' AND name NOT ILIKE '%pro%' AND name NOT ILIKE '%max%';

UPDATE products
SET
  name        = 'Audífonos Over-Ear Inalámbricos Premium',
  description = REGEXP_REPLACE(
    COALESCE(description, ''),
    '(AirPods\s*Max)',
    'audífonos over-ear',
    'gi'
  )
WHERE name ILIKE '%airpods%max%';

-- -------------------------------------------------------------------------
-- 2. Rename Apple Watch-family products
-- -------------------------------------------------------------------------
UPDATE products
SET
  name        = 'Smartwatch Ultra con GPS y Monitor de Salud',
  description = REGEXP_REPLACE(
    COALESCE(description, ''),
    '(Apple\s*Watch\s*Ultra)',
    'smartwatch Ultra',
    'gi'
  )
WHERE name ILIKE '%apple%watch%ultra%';

UPDATE products
SET
  name        = 'Smartwatch Deportivo con Sensor Cardíaco',
  description = REGEXP_REPLACE(
    COALESCE(description, ''),
    '(Apple\s*Watch)',
    'smartwatch',
    'gi'
  )
WHERE name ILIKE '%apple%watch%' AND name NOT ILIKE '%ultra%';

-- -------------------------------------------------------------------------
-- 3. Rename iPhone-family products (typically cases / accessories)
-- -------------------------------------------------------------------------
UPDATE products
SET
  name        = REGEXP_REPLACE(name, '(iPhone)', 'Smartphone', 'gi'),
  description = REGEXP_REPLACE(COALESCE(description, ''), '(iPhone)', 'smartphone', 'gi')
WHERE name ILIKE '%iphone%';

-- -------------------------------------------------------------------------
-- 4. Rename iPad-family products (cables, covers, etc.)
-- -------------------------------------------------------------------------
UPDATE products
SET
  name        = REGEXP_REPLACE(name, '(iPad)', 'Tablet', 'gi'),
  description = REGEXP_REPLACE(COALESCE(description, ''), '(iPad)', 'tablet', 'gi')
WHERE name ILIKE '%ipad%';

-- -------------------------------------------------------------------------
-- 5. Rename MacBook-family products
-- -------------------------------------------------------------------------
UPDATE products
SET
  name        = REGEXP_REPLACE(name, '(MacBook(\s*Pro|\s*Air)?)', 'Laptop', 'gi'),
  description = REGEXP_REPLACE(COALESCE(description, ''), '(MacBook(\s*Pro|\s*Air)?)', 'laptop', 'gi')
WHERE name ILIKE '%macbook%';

-- -------------------------------------------------------------------------
-- 6. MagSafe / Lightning cables → generic wording
-- -------------------------------------------------------------------------
UPDATE products
SET
  name        = REGEXP_REPLACE(name, '(MagSafe)', 'Cargador Magnético', 'gi'),
  description = REGEXP_REPLACE(COALESCE(description, ''), '(MagSafe)', 'cargador magnético', 'gi')
WHERE name ILIKE '%magsafe%' OR description ILIKE '%magsafe%';

UPDATE products
SET
  name        = REGEXP_REPLACE(name, '(Lightning)', 'USB-C', 'gi'),
  description = REGEXP_REPLACE(COALESCE(description, ''), '(Lightning)', 'USB-C', 'gi')
WHERE name ILIKE '%lightning%' OR description ILIKE '%lightning%';

-- -------------------------------------------------------------------------
-- 7. Cleanup of any remaining "Apple" word in names or descriptions
-- -------------------------------------------------------------------------
UPDATE products
SET
  name        = TRIM(REGEXP_REPLACE(name, '\s*\bApple\b\s*', ' ', 'gi')),
  description = REGEXP_REPLACE(COALESCE(description, ''), '\bApple\b', '', 'gi')
WHERE name ILIKE '%apple%' OR description ILIKE '%apple%';

-- -------------------------------------------------------------------------
-- 8. Normalize any double spaces introduced by the replacements
-- -------------------------------------------------------------------------
UPDATE products
SET
  name        = TRIM(REGEXP_REPLACE(name, '\s+', ' ', 'g')),
  description = TRIM(REGEXP_REPLACE(COALESCE(description, ''), '\s+', ' ', 'g'));

COMMIT;

-- -------------------------------------------------------------------------
-- Verification — should return 0 rows
-- -------------------------------------------------------------------------
SELECT id, name
FROM products
WHERE
  name ILIKE '%apple%'
  OR name ILIKE '%airpods%'
  OR name ILIKE '%iphone%'
  OR name ILIKE '%ipad%'
  OR name ILIKE '%macbook%'
  OR name ILIKE '%magsafe%'
  OR name ILIKE '%lightning%';
