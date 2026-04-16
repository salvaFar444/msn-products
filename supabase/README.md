# MSN Products — Supabase

## Orden de ejecución (primera vez, en Supabase SQL Editor)

1. `migrations/001_schema.sql` — tabla `products`, `admin_users`, bucket `product-images`, RLS, trigger `updated_at`, unique `products_name`.
2. `migrations/002_product_media.sql` — tabla `product_media`, bucket `product-videos`, backfill desde `products.image_url`.
3. `migrations/003_products_slug.sql` — columna `slug` + trigger auto-generador.
4. `migrations/004_extended_fields.sql` — columnas `long_description` y `specs` JSONB.
5. `migrations/005_reviews.sql` — tabla `product_reviews`.
6. `seeds/initial_products.sql` — datos iniciales (solo si la tabla está vacía; `ON CONFLICT DO NOTHING`).
7. `seeds/initial_reviews.sql` — reseñas iniciales.

## Regla de oro

- **`migrations/`**: solo `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX`, funciones, triggers, RLS. Idempotentes. Se pueden re-ejecutar sin dañar datos.
- **`seeds/`**: solo `INSERT` con `ON CONFLICT DO NOTHING`. Se corren **una sola vez manualmente**. Nunca desde código de la app.

## Archivo viejo `supabase/schema.sql`

⚠️ **Ese archivo contenía INSERTs sin `ON CONFLICT`**. Si lo re-ejecutabas, creaba duplicados. Ahora está reemplazado por el orden de arriba. No lo uses más.
