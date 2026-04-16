-- =========================================================================
-- MSN Products — Diagnostic: why are product images showing black?
--
-- The migration 001_remove_apple_references.sql ONLY touches `name` and
-- `description`. It does NOT modify `image_url`. If images look black
-- after running it, one of the following is happening:
--
--   1. `image_url` is NULL or empty — the product was never given an image
--   2. `image_url` points to the local `/img.jpg` placeholder (which may
--      not exist in /public anymore in your deployment)
--   3. `image_url` points to a Supabase Storage path that no longer exists
--      (bucket renamed, file deleted, or the bucket isn't public)
--
-- Run the query below in the Supabase SQL editor to diagnose:
-- =========================================================================

-- 1) Count products grouped by the kind of image URL they have
SELECT
  CASE
    WHEN image_url IS NULL OR image_url = '' THEN 'NULL or empty'
    WHEN image_url LIKE '/%'                 THEN 'Local path (/...)'
    WHEN image_url LIKE 'http%supabase.co%'  THEN 'Supabase Storage'
    WHEN image_url LIKE 'http%'              THEN 'Other external URL'
    ELSE 'Other'
  END                              AS image_source,
  COUNT(*)                         AS products
FROM products
GROUP BY image_source
ORDER BY products DESC;

-- 2) Show the first 10 products with their current image_url
SELECT id, name, image_url
FROM products
ORDER BY created_at
LIMIT 10;

-- 3) If your products use a local path like '/img.jpg', you probably want
--    to upload real images to Supabase Storage and then run:
--
--    UPDATE products
--    SET image_url = 'https://YOUR-PROJECT.supabase.co/storage/v1/object/public/product-images/' || id || '.jpg'
--    WHERE image_url IS NULL OR image_url = '' OR image_url = '/img.jpg';
--
--    (Replace YOUR-PROJECT with your Supabase project ref.)
