-- =========================================
-- Datos de Prueba
-- Sistema de Gestión de Transporte
-- =========================================

-- Limpiar datos existentes (excepto configuración)
TRUNCATE TABLE
    audit_log,
    notifications,
    deliveries,
    tracking_states,
    package_scans,
    shipment_packages,
    shipments,
    packages,
    orders,
    customers,
    users
CASCADE;

-- =========================================
-- USUARIOS
-- =========================================
-- Password para todos: admin123
-- Password para todos: admin123
INSERT INTO users (id, email, password_hash, first_name, last_name, role, phone, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@transport.com', '$2b$10$vhtEsSsecTbT5iy/GR95E.4Q0NgAGbveU9WVXsCANJdDXg0.w7cNW', 'Admin', 'Sistema', 'admin', '+56912345678', true),
('550e8400-e29b-41d4-a716-446655440002', 'operador1@transport.com', '$2b$10$vhtEsSsecTbT5iy/GR95E.4Q0NgAGbveU9WVXsCANJdDXg0.w7cNW', 'Juan', 'Pérez', 'operator', '+56987654321', true),
('550e8400-e29b-41d4-a716-446655440003', 'operador2@transport.com', '$2b$10$vhtEsSsecTbT5iy/GR95E.4Q0NgAGbveU9WVXsCANJdDXg0.w7cNW', 'María', 'González', 'operator', '+56976543210', true),
('550e8400-e29b-41d4-a716-446655440004', 'bodega@transport.com', '$2b$10$vhtEsSsecTbT5iy/GR95E.4Q0NgAGbveU9WVXsCANJdDXg0.w7cNW', 'Pedro', 'Ramírez', 'warehouse', '+56965432109', true);

-- =========================================
-- CLIENTES
-- =========================================
INSERT INTO customers (id, rut, business_name, contact_name, email, phone, mobile, address, city, region, is_active) VALUES
('650e8400-e29b-41d4-a716-446655440001', '76123456-7', 'Comercial del Sur Ltda.', 'Carlos Muñoz', 'contacto@comercialsur.cl', '+56452234567', '+56987654321', 'Av. Principal 123', 'Coyhaique', 'Aysén', true),
('650e8400-e29b-41d4-a716-446655440002', '77234567-8', 'Distribuidora Patagonia', 'Ana Soto', 'ventas@distpatagonia.cl', '+56452345678', '+56976543210', 'Calle Comercio 456', 'Coyhaique', 'Aysén', true),
('650e8400-e29b-41d4-a716-446655440003', '78345678-9', 'Importadora Regional S.A.', 'Luis Torres', 'info@impregional.cl', '+56452456789', '+56965432109', 'Los Aromos 789', 'Puerto Montt', 'Los Lagos', true),
('650e8400-e29b-41d4-a716-446655440004', '79456789-0', 'Supermercado El Ahorro', 'Patricia Vega', 'compras@elahorro.cl', '+56452567890', '+56954321098', 'Pasaje Central 321', 'Coyhaique', 'Aysén', true),
('650e8400-e29b-41d4-a716-446655440005', '80567890-1', 'Ferretería Total', 'Roberto Díaz', 'ventas@ferretotal.cl', '+56452678901', '+56943210987', 'Av. Industrial 654', 'Coyhaique', 'Aysén', true);

-- =========================================
-- TARIFAS DE FLETE
-- =========================================
INSERT INTO freight_rates (id, route_name, origin, destination, rate_per_kg, min_charge, effective_from, is_active) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'Santiago - Coyhaique', 'Santiago', 'Coyhaique', 500.00, 5000.00, '2025-01-01', true),
('750e8400-e29b-41d4-a716-446655440002', 'Santiago - Puerto Montt', 'Santiago', 'Puerto Montt', 300.00, 3000.00, '2025-01-01', true),
('750e8400-e29b-41d4-a716-446655440003', 'Puerto Montt - Coyhaique', 'Puerto Montt', 'Coyhaique', 400.00, 4000.00, '2025-01-01', true);

-- =========================================
-- CONFIGURACIÓN DE SEGUROS
-- =========================================
INSERT INTO insurance_config (id, name, rate, min_value, is_active) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'Seguro Estándar', 0.02, 1000000.00, true),
('850e8400-e29b-41d4-a716-446655440002', 'Seguro Premium', 0.015, 5000000.00, true);

-- =========================================
-- ÓRDENES DE RECEPCIÓN (Ejemplos)
-- =========================================
INSERT INTO orders (id, order_number, customer_id, created_by, total_packages, total_weight, declared_value, origin, destination, freight_charge, insurance_charge, other_charges, total_charge, status, notes) VALUES
('950e8400-e29b-41d4-a716-446655440001', 'OR-202501-000001', '650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 3, 45.5, 1500000, 'Santiago', 'Coyhaique', 22750, 30000, 0, 52750, 'EN_BODEGA_ORIGEN', 'Carga frágil - manejar con cuidado'),
('950e8400-e29b-41d4-a716-446655440002', 'OR-202501-000002', '650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 5, 120.0, 800000, 'Santiago', 'Coyhaique', 60000, 0, 0, 60000, 'EN_TRANSITO_PUERTO', 'Entrega urgente'),
('950e8400-e29b-41d4-a716-446655440003', 'OR-202501-000003', '650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 2, 35.0, 2500000, 'Santiago', 'Puerto Montt', 10500, 50000, 0, 60500, 'EN_BODEGA_PUERTO', NULL),
('950e8400-e29b-41d4-a716-446655440004', 'OR-202501-000004', '650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 8, 200.0, 500000, 'Santiago', 'Coyhaique', 100000, 0, 0, 100000, 'LISTO_RETIRO', 'Cliente notificado'),
('950e8400-e29b-41d4-a716-446655440005', 'OR-202501-000005', '650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 4, 75.0, 3200000, 'Santiago', 'Coyhaique', 37500, 64000, 0, 101500, 'RECIBIDO', 'Material de construcción');

-- =========================================
-- BULTOS
-- =========================================
INSERT INTO packages (id, order_id, package_number, sequence_number, description, weight, current_status, current_location, barcode) VALUES
-- Orden 1
('a50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'OR-202501-000001-P001', 1, 'Electrodomésticos', 15.5, 'EN_BODEGA_ORIGEN', 'Bodega Santiago', 'PKG001000001'),
('a50e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440001', 'OR-202501-000001-P002', 2, 'Electrodomésticos', 15.0, 'EN_BODEGA_ORIGEN', 'Bodega Santiago', 'PKG001000002'),
('a50e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440001', 'OR-202501-000001-P003', 3, 'Electrodomésticos', 15.0, 'EN_BODEGA_ORIGEN', 'Bodega Santiago', 'PKG001000003'),

-- Orden 2
('a50e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440002', 'OR-202501-000002-P001', 1, 'Alimentos no perecibles', 25.0, 'EN_TRANSITO_PUERTO', 'En ruta a Puerto Montt', 'PKG002000001'),
('a50e8400-e29b-41d4-a716-446655440005', '950e8400-e29b-41d4-a716-446655440002', 'OR-202501-000002-P002', 2, 'Alimentos no perecibles', 24.0, 'EN_TRANSITO_PUERTO', 'En ruta a Puerto Montt', 'PKG002000002'),
('a50e8400-e29b-41d4-a716-446655440006', '950e8400-e29b-41d4-a716-446655440002', 'OR-202501-000002-P003', 3, 'Alimentos no perecibles', 23.5, 'EN_TRANSITO_PUERTO', 'En ruta a Puerto Montt', 'PKG002000003'),
('a50e8400-e29b-41d4-a716-446655440007', '950e8400-e29b-41d4-a716-446655440002', 'OR-202501-000002-P004', 4, 'Alimentos no perecibles', 24.0, 'EN_TRANSITO_PUERTO', 'En ruta a Puerto Montt', 'PKG002000004'),
('a50e8400-e29b-41d4-a716-446655440008', '950e8400-e29b-41d4-a716-446655440002', 'OR-202501-000002-P005', 5, 'Alimentos no perecibles', 23.5, 'EN_TRANSITO_PUERTO', 'En ruta a Puerto Montt', 'PKG002000005'),

-- Orden 3
('a50e8400-e29b-41d4-a716-446655440009', '950e8400-e29b-41d4-a716-446655440003', 'OR-202501-000003-P001', 1, 'Equipos de oficina', 18.0, 'EN_BODEGA_PUERTO', 'Bodega Puerto Montt', 'PKG003000001'),
('a50e8400-e29b-41d4-a716-446655440010', '950e8400-e29b-41d4-a716-446655440003', 'OR-202501-000003-P002', 2, 'Equipos de oficina', 17.0, 'EN_BODEGA_PUERTO', 'Bodega Puerto Montt', 'PKG003000002'),

-- Orden 4
('a50e8400-e29b-41d4-a716-446655440011', '950e8400-e29b-41d4-a716-446655440004', 'OR-202501-000004-P001', 1, 'Mercadería general', 25.0, 'LISTO_RETIRO', 'Bodega Coyhaique', 'PKG004000001'),
('a50e8400-e29b-41d4-a716-446655440012', '950e8400-e29b-41d4-a716-446655440004', 'OR-202501-000004-P002', 2, 'Mercadería general', 25.0, 'LISTO_RETIRO', 'Bodega Coyhaique', 'PKG004000002'),
('a50e8400-e29b-41d4-a716-446655440013', '950e8400-e29b-41d4-a716-446655440004', 'OR-202501-000004-P003', 3, 'Mercadería general', 25.0, 'LISTO_RETIRO', 'Bodega Coyhaique', 'PKG004000003'),
('a50e8400-e29b-41d4-a716-446655440014', '950e8400-e29b-41d4-a716-446655440004', 'OR-202501-000004-P004', 4, 'Mercadería general', 25.0, 'LISTO_RETIRO', 'Bodega Coyhaique', 'PKG004000004'),
('a50e8400-e29b-41d4-a716-446655440015', '950e8400-e29b-41d4-a716-446655440004', 'OR-202501-000004-P005', 5, 'Mercadería general', 25.0, 'LISTO_RETIRO', 'Bodega Coyhaique', 'PKG004000005'),
('a50e8400-e29b-41d4-a716-446655440016', '950e8400-e29b-41d4-a716-446655440004', 'OR-202501-000004-P006', 6, 'Mercadería general', 25.0, 'LISTO_RETIRO', 'Bodega Coyhaique', 'PKG004000006'),
('a50e8400-e29b-41d4-a716-446655440017', '950e8400-e29b-41d4-a716-446655440004', 'OR-202501-000004-P007', 7, 'Mercadería general', 25.0, 'LISTO_RETIRO', 'Bodega Coyhaique', 'PKG004000007'),
('a50e8400-e29b-41d4-a716-446655440018', '950e8400-e29b-41d4-a716-446655440004', 'OR-202501-000004-P008', 8, 'Mercadería general', 25.0, 'LISTO_RETIRO', 'Bodega Coyhaique', 'PKG004000008'),

-- Orden 5
('a50e8400-e29b-41d4-a716-446655440019', '950e8400-e29b-41d4-a716-446655440005', 'OR-202501-000005-P001', 1, 'Cemento', 20.0, 'RECIBIDO', 'Bodega Santiago', 'PKG005000001'),
('a50e8400-e29b-41d4-a716-446655440020', '950e8400-e29b-41d4-a716-446655440005', 'OR-202501-000005-P002', 2, 'Cemento', 20.0, 'RECIBIDO', 'Bodega Santiago', 'PKG005000002'),
('a50e8400-e29b-41d4-a716-446655440021', '950e8400-e29b-41d4-a716-446655440005', 'OR-202501-000005-P003', 3, 'Fierro', 18.0, 'RECIBIDO', 'Bodega Santiago', 'PKG005000003'),
('a50e8400-e29b-41d4-a716-446655440022', '950e8400-e29b-41d4-a716-446655440005', 'OR-202501-000005-P004', 4, 'Herramientas', 17.0, 'RECIBIDO', 'Bodega Santiago', 'PKG005000004');

-- =========================================
-- TRACKING STATES (Estados de ejemplo)
-- =========================================
INSERT INTO tracking_states (package_id, order_id, state, location, description, changed_by, changed_at) VALUES
-- Paquete 1
('a50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'RECIBIDO', 'Bodega Santiago', 'Carga recibida en bodega de origen', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '2 days'),
('a50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'EN_BODEGA_ORIGEN', 'Bodega Santiago', 'Almacenado esperando despacho', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '1 day'),

-- Paquete 4 (en tránsito)
('a50e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440002', 'RECIBIDO', 'Bodega Santiago', 'Carga recibida', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '3 days'),
('a50e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440002', 'EN_BODEGA_ORIGEN', 'Bodega Santiago', 'Almacenado', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '2 days'),
('a50e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440002', 'EN_TRANSITO_PUERTO', 'En ruta', 'Despachado hacia Puerto Montt', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '1 day'),

-- Paquete 11 (listo para retiro)
('a50e8400-e29b-41d4-a716-446655440011', '950e8400-e29b-41d4-a716-446655440004', 'RECIBIDO', 'Bodega Santiago', 'Carga recibida', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '7 days'),
('a50e8400-e29b-41d4-a716-446655440011', '950e8400-e29b-41d4-a716-446655440004', 'EN_BODEGA_ORIGEN', 'Bodega Santiago', 'Almacenado', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '6 days'),
('a50e8400-e29b-41d4-a716-446655440011', '950e8400-e29b-41d4-a716-446655440004', 'EN_TRANSITO_PUERTO', 'En ruta', 'En camino a Puerto Montt', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '5 days'),
('a50e8400-e29b-41d4-a716-446655440011', '950e8400-e29b-41d4-a716-446655440004', 'EN_BODEGA_PUERTO', 'Bodega Puerto Montt', 'Almacenado en Puerto Montt', '550e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '4 days'),
('a50e8400-e29b-41d4-a716-446655440011', '950e8400-e29b-41d4-a716-446655440004', 'EN_TRANSITO_DESTINO', 'En ruta', 'En camino a Coyhaique', '550e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '2 days'),
('a50e8400-e29b-41d4-a716-446655440011', '950e8400-e29b-41d4-a716-446655440004', 'EN_BODEGA_DESTINO', 'Bodega Coyhaique', 'Almacenado en destino', '550e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '1 day'),
('a50e8400-e29b-41d4-a716-446655440011', '950e8400-e29b-41d4-a716-446655440004', 'LISTO_RETIRO', 'Bodega Coyhaique', 'Disponible para retiro', '550e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '6 hours');

-- =========================================
-- VIAJES/MANIFIESTOS
-- =========================================
INSERT INTO shipments (id, shipment_number, origin, destination, vehicle_plate, driver_name, driver_phone, scheduled_departure, total_packages, total_weight, total_value, status, created_by) VALUES
('b50e8400-e29b-41d4-a716-446655440001', 'SH-202501-000001', 'Santiago', 'Puerto Montt', 'AABB12', 'José Martínez', '+56987123456', NOW() + INTERVAL '1 day', 5, 120.0, 800000, 'PLANNING', '550e8400-e29b-41d4-a716-446655440001'),
('b50e8400-e29b-41d4-a716-446655440002', 'SH-202501-000002', 'Puerto Montt', 'Coyhaique', 'CCDD34', 'Diego Silva', '+56976234567', NOW() + INTERVAL '3 days', 0, 0, 0, 'PLANNING', '550e8400-e29b-41d4-a716-446655440001');

-- =========================================
-- DATOS COMPLETADOS
-- =========================================
