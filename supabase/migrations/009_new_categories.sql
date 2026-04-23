-- 009_new_categories.sql
-- Replace the 4-category CHECK constraint with the expanded 7-category set.

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

ALTER TABLE products
  ADD CONSTRAINT products_category_check
  CHECK (category IN (
    'Audio',
    'Relojes Inteligentes',
    'Cables',
    'Cargadores',
    'Gaming',
    'Hogar Tech',
    'Cuidado Personal'
  ));
