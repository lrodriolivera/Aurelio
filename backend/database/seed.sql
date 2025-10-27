-- =========================================
-- Transport Management System - Seed Data
-- Initial Data for Production Deployment
-- =========================================

-- =========================================
-- ADMIN USER
-- Password: admin123 (CHANGE THIS IN PRODUCTION!)
-- =========================================
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'admin@transport.com',
    '$2b$10$FS7fGSIBxTj9dP8moCm3Qudcqin8OkWKU/48BG2yBM5JwtoY3pROC',  -- Password: admin123 (CHANGE IN PRODUCTION!)
    'Admin',
    'Sistema',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- =========================================
-- SAMPLE CUSTOMER
-- =========================================
INSERT INTO customers (id, rut, business_name, contact_name, email, phone, address, city, is_active)
VALUES (
    '650e8400-e29b-41d4-a716-446655440001'::uuid,
    '76.123.456-7',
    'Empresa Demo S.A.',
    'Juan Pérez',
    'contacto@empresademo.cl',
    '+56912345678',
    'Av. Principal 123',
    'Santiago',
    true
) ON CONFLICT (rut) DO NOTHING;

-- =========================================
-- FREIGHT RATES (Sample Routes)
-- =========================================
INSERT INTO freight_rates (origin, destination, rate_per_kg, minimum_charge, effective_date, is_active)
VALUES
    ('Santiago', 'Coyhaique', 1500.00, 15000.00, CURRENT_DATE, true),
    ('Santiago', 'Puerto Montt', 800.00, 8000.00, CURRENT_DATE, true),
    ('Santiago', 'Puerto Aysén', 1700.00, 17000.00, CURRENT_DATE, true),
    ('Santiago', 'Balmaceda', 1600.00, 16000.00, CURRENT_DATE, true),
    ('Puerto Montt', 'Coyhaique', 1000.00, 10000.00, CURRENT_DATE, true),
    ('Puerto Montt', 'Puerto Aysén', 1200.00, 12000.00, CURRENT_DATE, true)
ON CONFLICT DO NOTHING;

-- =========================================
-- INSURANCE RATES
-- =========================================
INSERT INTO insurance (min_value, max_value, rate_percentage, minimum_premium, effective_date, is_active)
VALUES
    (0.00, 500000.00, 0.00, 0.00, CURRENT_DATE, true),
    (500000.01, 2000000.00, 1.50, 7500.00, CURRENT_DATE, true),
    (2000000.01, 5000000.00, 2.00, 30000.00, CURRENT_DATE, true),
    (5000000.01, NULL, 2.50, 100000.00, CURRENT_DATE, true)
ON CONFLICT DO NOTHING;

-- =========================================
-- SAMPLE ORDER (Optional - for testing)
-- =========================================
-- Uncomment if you want sample data for testing
/*
INSERT INTO orders (
    id, order_number, customer_id, origin, destination,
    declared_value, freight_charge, insurance_charge, total_charge,
    total_weight, total_packages, notes, created_by
)
VALUES (
    '750e8400-e29b-41d4-a716-446655440001'::uuid,
    'OR-2025-00001',
    '650e8400-e29b-41d4-a716-446655440001'::uuid,
    'Santiago',
    'Coyhaique',
    1000000.00,
    15000.00,
    15000.00,
    30000.00,
    10.00,
    1,
    'Orden de prueba',
    '550e8400-e29b-41d4-a716-446655440001'::uuid
) ON CONFLICT (order_number) DO NOTHING;

-- Sample Package for the Order
INSERT INTO packages (
    id, order_id, package_number, weight, description, current_status
)
VALUES (
    '850e8400-e29b-41d4-a716-446655440001'::uuid,
    '750e8400-e29b-41d4-a716-446655440001'::uuid,
    'PKG-2025-00001',
    10.00,
    'Paquete de prueba',
    'RECIBIDO'
) ON CONFLICT (package_number) DO NOTHING;
*/
