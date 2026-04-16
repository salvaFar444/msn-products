-- =====================================================
-- MSN Products — Seeds: reseñas iniciales
-- =====================================================
-- Correr UNA VEZ manualmente después de 005_reviews.sql.
-- Solo inserta si el producto existe y si la reseña aún no existe
-- (usamos una combinación author_name + comment como heurística de dedup).
-- =====================================================

-- Helper: inserta una reseña solo si no existe otra idéntica para el mismo producto.
CREATE OR REPLACE FUNCTION seed_review_if_missing(
  p_product_name TEXT,
  p_author TEXT,
  p_city TEXT,
  p_rating INTEGER,
  p_comment TEXT,
  p_verified BOOLEAN DEFAULT TRUE
) RETURNS VOID AS $$
DECLARE
  pid UUID;
BEGIN
  SELECT id INTO pid FROM products WHERE name = p_product_name LIMIT 1;
  IF pid IS NULL THEN
    RAISE NOTICE 'Producto no encontrado: %', p_product_name;
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM product_reviews
    WHERE product_id = pid AND author_name = p_author AND comment = p_comment
  ) THEN
    INSERT INTO product_reviews (product_id, author_name, author_city, rating, comment, is_verified)
    VALUES (pid, p_author, p_city, p_rating, p_comment, p_verified);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Smartwatch
SELECT seed_review_if_missing(
  'Smartwatch Deportivo con Sensor Cardíaco',
  'Juliana Pacheco', 'Montería', 5,
  'Muy cómodo para entrenar, la batería me aguantó toda la semana. Llegó rapidísimo a mi casa.'
);
SELECT seed_review_if_missing(
  'Smartwatch Deportivo con Sensor Cardíaco',
  'Carlos Mendoza', 'Cereté', 4,
  'Buen reloj, el GPS a veces demora en enganchar pero todo lo demás excelente.'
);

-- Audífonos Pro
SELECT seed_review_if_missing(
  'Audífonos Inalámbricos Pro con Cancelación de Ruido',
  'Daniela Suárez', 'Montería', 5,
  'La cancelación de ruido funciona muy bien en el trabajo. Para el precio están buenísimos.'
);
SELECT seed_review_if_missing(
  'Audífonos Inalámbricos Pro con Cancelación de Ruido',
  'Sebastián Ortiz', 'Lorica', 5,
  'Coordinamos todo por WhatsApp, súper atentos. Los audífonos se oyen muy nítidos.'
);

-- Audífonos Pro 3
SELECT seed_review_if_missing(
  'Audífonos Inalámbricos Pro 3ra Generación',
  'Natalia Bermúdez', 'Montería', 5,
  'Valió cada peso, calidad de audio superior a los que tenía antes. 100% recomendados.'
);

-- Básicos
SELECT seed_review_if_missing(
  'Audífonos Inalámbricos Básicos con Estuche de Carga',
  'Andrés Rincón', 'Planeta Rica', 4,
  'Para el uso diario están perfectos. La carga del estuche rinde mucho.'
);

-- Cable USB-C
SELECT seed_review_if_missing(
  'Cable USB-C a USB-C',
  'Laura Mejía', 'Montería', 5,
  'Carga mucho más rápido que los cables genéricos. Y se siente resistente el trenzado.'
);

-- Cargador 20W
SELECT seed_review_if_missing(
  'Cargador USB-C 20W de Carga Rápida',
  'Felipe Arroyo', 'Cereté', 5,
  'Pequeñito y carga el celular a una velocidad impresionante. Todo llegó en buen estado.'
);

-- Over-Ear Premium
SELECT seed_review_if_missing(
  'Audífonos Over-Ear Inalámbricos Premium',
  'Mariana Villalba', 'Montería', 5,
  'Son un lujo. Me los traen a la casa en El Recreo, pagué cuando los recibí. Brutales.'
);

-- Limpiar helper (opcional — déjalo si quieres reutilizarlo)
-- DROP FUNCTION seed_review_if_missing(TEXT, TEXT, TEXT, INTEGER, TEXT, BOOLEAN);
