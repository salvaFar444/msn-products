-- 010_reclassify_products.sql
-- Reclassify existing products into the new 7-category taxonomy.
-- Run AFTER 009_new_categories.sql.

-- Gaming: PS4/PS5/Xbox controllers and gaming accessories
UPDATE products SET category = 'Gaming'
WHERE name ILIKE '%DualShock%'
   OR name ILIKE '%PS4%'
   OR name ILIKE '%PS5%'
   OR name ILIKE '%Xbox%'
   OR name ILIKE '%control%sony%'
   OR name ILIKE '%control%inalámbrico%'
   OR name ILIKE '%control%inalambrico%'
   OR name ILIKE '%gamer%'
   OR name ILIKE '%Astronix%';

-- Hogar Tech: TV Sticks, mounts, lighting
UPDATE products SET category = 'Hogar Tech'
WHERE name ILIKE '%TV Stick%'
   OR name ILIKE '%Google TV%'
   OR name ILIKE '%Chromecast%'
   OR name ILIKE '%onn%'
   OR name ILIKE '%aro de luz%'
   OR name ILIKE '%ring light%'
   OR name ILIKE '%soporte%TV%'
   OR name ILIKE '%soporte%pared%'
   OR name ILIKE '%proyector%';

-- Cuidado Personal: trimmers, shavers, grooming
UPDATE products SET category = 'Cuidado Personal'
WHERE name ILIKE '%patillera%'
   OR name ILIKE '%barbera%'
   OR name ILIKE '%barbero%'
   OR name ILIKE '%trimmer%'
   OR name ILIKE '%afeitadora%'
   OR name ILIKE '%VGR%'
   OR name ILIKE '%T9%';

-- Cables: USB-C hubs, adapters
UPDATE products SET category = 'Cables'
WHERE name ILIKE '%adaptador USB-C 8%'
   OR name ILIKE '%hub%'
   OR name ILIKE '%adaptador multipuerto%';

-- Audio: intercomunicadores, micrófonos de solapa
UPDATE products SET category = 'Audio'
WHERE name ILIKE '%intercomunicador%'
   OR name ILIKE '%MCM%'
   OR name ILIKE '%micrófono%'
   OR name ILIKE '%microfono%'
   OR name ILIKE '%solapa%'
   OR name ILIKE '%F11%';

-- Relojes Inteligentes: smartwatches and fitness bands
UPDATE products SET category = 'Relojes Inteligentes'
WHERE name ILIKE '%Smart Band%'
   OR name ILIKE '%Xiaomi%Band%'
   OR name ILIKE '%Apple Watch%'
   OR name ILIKE '%smartwatch%'
   OR name ILIKE '%Harvic 593%'
   OR name ILIKE '%HK29%'
   OR name ILIKE '%C60%'
   OR name ILIKE '%Ultra%'
   OR name ILIKE '%pulsera%';

-- Final sweep: any product still tagged 'Wearables' becomes 'Relojes Inteligentes'
UPDATE products SET category = 'Relojes Inteligentes'
WHERE category = 'Wearables';

-- Verification query (safe to run repeatedly)
-- SELECT category, COUNT(*) AS total, STRING_AGG(short_name, ', ') AS productos
-- FROM products
-- GROUP BY category
-- ORDER BY category;
