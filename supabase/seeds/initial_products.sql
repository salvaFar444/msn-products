-- =====================================================
-- MSN Products — Seeds: productos iniciales
-- =====================================================
-- ⚠️  CORRER UNA VEZ MANUALMENTE, JAMÁS desde código de la app.
-- El ON CONFLICT garantiza que re-ejecutarlo NO duplica ni sobrescribe tus edits.
-- Requiere que ya exista el constraint products_name_unique (001_schema.sql lo crea).
-- =====================================================

INSERT INTO products (name, short_name, category, price, description, image_url, badge, stock, features)
VALUES
('Smartwatch Deportivo con Sensor Cardíaco',
 'Smartwatch Deportivo',
 'Relojes Inteligentes',
 150000,
 'Smartwatch con monitoreo de salud avanzado y conectividad con tu smartphone.',
 '/img.jpg',
 'Más vendido',
 10,
 ARRAY['Monitoreo de frecuencia cardíaca', 'GPS integrado', 'Resistente al agua', 'Batería de 18 horas', 'Detección de caídas']),

('Audífonos Inalámbricos Pro con Cancelación de Ruido',
 'Audífonos Pro',
 'Audio',
 65000,
 'Cancelación activa de ruido mejorada con audio espacial personalizado.',
 '/img.jpg',
 NULL,
 15,
 ARRAY['Cancelación activa de ruido', 'Audio espacial personalizado', 'Resistencia al agua IPX4', 'Hasta 6h reproducción', 'Estuche con carga inalámbrica']),

('Audífonos Inalámbricos Pro 3ra Generación',
 'Audífonos Pro 3',
 'Audio',
 75000,
 'La evolución definitiva de nuestros audífonos Pro con sonido de siguiente nivel.',
 '/img.jpg',
 'Nuevo',
 12,
 ARRAY['Chip mejorado', 'ANC de clase mundial', 'Audio sin pérdidas (via cable)', 'Hasta 7h reproducción', 'Estuche USB-C']),

('Audífonos Inalámbricos Básicos con Estuche de Carga',
 'Audífonos Básicos',
 'Audio',
 75000,
 'Los audífonos más cómodos con diseño renovado y audio de alta calidad.',
 '/img.jpg',
 NULL,
 8,
 ARRAY['Nuevo diseño ergonómico', 'Audio adaptativo', 'Estuche de carga', 'Hasta 5h reproducción', 'Carga inalámbrica']),

('Cable USB-C a USB-C',
 'Cable USB-C',
 'Cables',
 50000,
 'Cable de carga rápida trenzado, compatible con todos tus dispositivos USB-C.',
 '/img.jpg',
 NULL,
 30,
 ARRAY['Carga rápida 60W', 'Transferencia de datos 480 Mbps', 'Nylon trenzado resistente', '1 metro de largo', 'Compatible con carga magnética']),

('Cargador USB-C 20W de Carga Rápida',
 'Cargador USB-C 20W',
 'Cargadores',
 60000,
 'Adaptador de carga rápida USB-C de 20W, compacto y universal.',
 '/img.jpg',
 NULL,
 20,
 ARRAY['20W de potencia', 'Carga rápida universal', 'Compacto y liviano', 'Compatible con laptops ligeras', 'Certificado de seguridad']),

('Audífonos Over-Ear Inalámbricos Premium',
 'Over-Ear Premium',
 'Audio',
 150000,
 'Over-ear de primera clase con cancelación de ruido premium y audio envolvente.',
 '/img.jpg',
 'Premium',
 5,
 ARRAY['Cancelación de ruido líder', 'Audio espacial envolvente', 'Control de volumen rotatorio', '20h de batería', 'Diadema de malla transpirable'])

ON CONFLICT (name) DO NOTHING;
