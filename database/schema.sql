-- =========================================
-- Sistema de Gestión de Transporte de Carga
-- Database Schema
-- PostgreSQL 15+
-- =========================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- TABLA: users
-- Descripción: Usuarios del sistema
-- =========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'operator',
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- =========================================
-- TABLA: customers
-- Descripción: Clientes del transporte
-- =========================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rut VARCHAR(12) UNIQUE NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(200),
    email VARCHAR(255),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_rut ON customers(rut);
CREATE INDEX idx_customers_business_name ON customers(business_name);
CREATE INDEX idx_customers_is_active ON customers(is_active);

-- =========================================
-- TABLA: freight_rates
-- Descripción: Tarifas de flete por kg/ruta
-- =========================================
CREATE TABLE IF NOT EXISTS freight_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_name VARCHAR(200) NOT NULL,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    rate_per_kg DECIMAL(10, 2) NOT NULL,
    min_charge DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_freight_rates_route ON freight_rates(origin, destination);
CREATE INDEX idx_freight_rates_active ON freight_rates(is_active);

-- =========================================
-- TABLA: insurance_config
-- Descripción: Configuración de seguros
-- =========================================
CREATE TABLE IF NOT EXISTS insurance_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    rate DECIMAL(5, 4) NOT NULL DEFAULT 0.02,
    min_value DECIMAL(12, 2) NOT NULL DEFAULT 1000000,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- TABLA: orders
-- Descripción: Órdenes de Recepción (OR)
-- =========================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    created_by UUID NOT NULL REFERENCES users(id),

    -- Detalles de la carga
    total_packages INTEGER NOT NULL DEFAULT 0,
    total_weight DECIMAL(10, 2) NOT NULL DEFAULT 0,
    declared_value DECIMAL(12, 2) NOT NULL DEFAULT 0,

    -- Ruta
    origin VARCHAR(100) NOT NULL DEFAULT 'Santiago',
    destination VARCHAR(100) NOT NULL,

    -- Costos
    freight_charge DECIMAL(10, 2) NOT NULL DEFAULT 0,
    insurance_charge DECIMAL(10, 2) DEFAULT 0,
    other_charges DECIMAL(10, 2) DEFAULT 0,
    total_charge DECIMAL(12, 2) NOT NULL DEFAULT 0,

    -- Estado
    status VARCHAR(50) NOT NULL DEFAULT 'CREATED',

    -- QR Code
    qr_code TEXT,

    -- Observaciones
    notes TEXT,
    special_instructions TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_packages_positive CHECK (total_packages > 0),
    CONSTRAINT check_weight_positive CHECK (total_weight > 0)
);

CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- =========================================
-- TABLA: packages
-- Descripción: Bultos individuales de cada orden
-- =========================================
CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    package_number VARCHAR(50) UNIQUE NOT NULL,

    -- Detalles del bulto
    sequence_number INTEGER NOT NULL,
    description TEXT,
    weight DECIMAL(10, 2) NOT NULL,
    length DECIMAL(8, 2),
    width DECIMAL(8, 2),
    height DECIMAL(8, 2),
    volume DECIMAL(10, 3),

    -- QR/Barcode
    qr_code TEXT,
    barcode VARCHAR(100),

    -- Estado actual
    current_status VARCHAR(50) NOT NULL DEFAULT 'RECIBIDO',
    current_location VARCHAR(100),

    -- Label printing
    label_printed BOOLEAN DEFAULT false,
    label_printed_at TIMESTAMP,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_weight_positive CHECK (weight > 0)
);

CREATE INDEX idx_packages_order ON packages(order_id);
CREATE INDEX idx_packages_number ON packages(package_number);
CREATE INDEX idx_packages_barcode ON packages(barcode);
CREATE INDEX idx_packages_status ON packages(current_status);

-- =========================================
-- TABLA: shipments
-- Descripción: Viajes/Manifiestos
-- =========================================
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_number VARCHAR(50) UNIQUE NOT NULL,

    -- Ruta
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,

    -- Vehículo/Conductor
    vehicle_plate VARCHAR(20),
    driver_name VARCHAR(200),
    driver_phone VARCHAR(20),

    -- Fechas
    scheduled_departure TIMESTAMP,
    actual_departure TIMESTAMP,
    estimated_arrival TIMESTAMP,
    actual_arrival TIMESTAMP,

    -- Estadísticas
    total_packages INTEGER DEFAULT 0,
    total_weight DECIMAL(10, 2) DEFAULT 0,
    total_value DECIMAL(12, 2) DEFAULT 0,

    -- Estado
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNING',

    -- Manifest
    manifest_generated BOOLEAN DEFAULT false,
    manifest_generated_at TIMESTAMP,
    manifest_url TEXT,

    -- Creación
    created_by UUID NOT NULL REFERENCES users(id),

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shipments_number ON shipments(shipment_number);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_departure ON shipments(scheduled_departure);
CREATE INDEX idx_shipments_created_at ON shipments(created_at DESC);

-- =========================================
-- TABLA: shipment_packages
-- Descripción: Relación entre viajes y bultos
-- =========================================
CREATE TABLE IF NOT EXISTS shipment_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,

    loaded_at TIMESTAMP,
    loaded_by UUID REFERENCES users(id),

    unloaded_at TIMESTAMP,
    unloaded_by UUID REFERENCES users(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_shipment_package UNIQUE(shipment_id, package_id)
);

CREATE INDEX idx_shipment_packages_shipment ON shipment_packages(shipment_id);
CREATE INDEX idx_shipment_packages_package ON shipment_packages(package_id);

-- =========================================
-- TABLA: package_scans
-- Descripción: Registro de escaneos de bultos
-- =========================================
CREATE TABLE IF NOT EXISTS package_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    shipment_id UUID REFERENCES shipments(id),

    scan_type VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL,

    scanned_by UUID NOT NULL REFERENCES users(id),
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_package_scans_package ON package_scans(package_id);
CREATE INDEX idx_package_scans_shipment ON package_scans(shipment_id);
CREATE INDEX idx_package_scans_type ON package_scans(scan_type);
CREATE INDEX idx_package_scans_scanned_at ON package_scans(scanned_at DESC);

-- =========================================
-- TABLA: tracking_states
-- Descripción: Estados de seguimiento de bultos (8 estados)
-- PARTICIONADA por mes para performance
-- =========================================
CREATE TABLE IF NOT EXISTS tracking_states (
    id UUID DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    state VARCHAR(50) NOT NULL,
    location VARCHAR(100),
    description TEXT,

    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    metadata JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Crear particiones para los próximos 12 meses
CREATE TABLE tracking_states_2025_01 PARTITION OF tracking_states
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE tracking_states_2025_02 PARTITION OF tracking_states
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE tracking_states_2025_03 PARTITION OF tracking_states
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE tracking_states_2025_04 PARTITION OF tracking_states
    FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE tracking_states_2025_05 PARTITION OF tracking_states
    FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE tracking_states_2025_06 PARTITION OF tracking_states
    FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');
CREATE TABLE tracking_states_2025_07 PARTITION OF tracking_states
    FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');
CREATE TABLE tracking_states_2025_08 PARTITION OF tracking_states
    FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
CREATE TABLE tracking_states_2025_09 PARTITION OF tracking_states
    FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
CREATE TABLE tracking_states_2025_10 PARTITION OF tracking_states
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE tracking_states_2025_11 PARTITION OF tracking_states
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
CREATE TABLE tracking_states_2025_12 PARTITION OF tracking_states
    FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

CREATE INDEX idx_tracking_states_package ON tracking_states(package_id, created_at DESC);
CREATE INDEX idx_tracking_states_order ON tracking_states(order_id, created_at DESC);
CREATE INDEX idx_tracking_states_state ON tracking_states(state);

-- =========================================
-- TABLA: deliveries
-- Descripción: Entregas y retiros
-- =========================================
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES packages(id),
    order_id UUID NOT NULL REFERENCES orders(id),

    delivery_type VARCHAR(50) NOT NULL,

    -- Receptor
    recipient_name VARCHAR(200) NOT NULL,
    recipient_rut VARCHAR(12),
    recipient_phone VARCHAR(20),

    -- Firma digital
    signature_data TEXT,
    signature_url TEXT,

    -- Entrega a domicilio
    delivery_address TEXT,
    delivery_city VARCHAR(100),
    delivery_notes TEXT,

    -- Fechas
    scheduled_at TIMESTAMP,
    delivered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Personal
    delivered_by UUID REFERENCES users(id),

    -- Estado
    status VARCHAR(50) DEFAULT 'PENDING',

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deliveries_package ON deliveries(package_id);
CREATE INDEX idx_deliveries_order ON deliveries(order_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_delivered_at ON deliveries(delivered_at DESC);

-- =========================================
-- TABLA: notifications
-- Descripción: Historial de notificaciones
-- =========================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    order_id UUID REFERENCES orders(id),
    package_id UUID REFERENCES packages(id),

    notification_type VARCHAR(50) NOT NULL,
    channel VARCHAR(50) NOT NULL,

    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    message TEXT NOT NULL,

    status VARCHAR(50) DEFAULT 'PENDING',
    sent_at TIMESTAMP,
    error_message TEXT,

    metadata JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_customer ON notifications(customer_id);
CREATE INDEX idx_notifications_order ON notifications(order_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =========================================
-- TABLA: audit_log
-- Descripción: Registro de auditoría
-- =========================================
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),

    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,

    old_values JSONB,
    new_values JSONB,

    ip_address VARCHAR(45),
    user_agent TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- =========================================
-- TABLA: system_config
-- Descripción: Configuración del sistema
-- =========================================
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    data_type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_config_key ON system_config(key);

-- =========================================
-- TRIGGERS: Actualización automática de timestamps
-- =========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_freight_rates_updated_at BEFORE UPDATE ON freight_rates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_config_updated_at BEFORE UPDATE ON insurance_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- DATOS INICIALES
-- =========================================

-- Usuario administrador por defecto
-- Password: admin123 (cambiar en producción)
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES (
    'admin@transport.com',
    '$2b$10$vhtEsSsecTbT5iy/GR95E.4Q0NgAGbveU9WVXsCANJdDXg0.w7cNW',  -- Password: admin123
    'Admin',
    'Sistema',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- Configuración de tarifa por defecto
INSERT INTO freight_rates (route_name, origin, destination, rate_per_kg, min_charge, effective_from, is_active)
VALUES (
    'Santiago - Coyhaique',
    'Santiago',
    'Coyhaique',
    500.00,
    5000.00,
    '2025-01-01',
    true
) ON CONFLICT DO NOTHING;

-- Configuración de seguro por defecto
INSERT INTO insurance_config (name, rate, min_value, is_active)
VALUES (
    'Seguro Estándar',
    0.02,
    1000000.00,
    true
) ON CONFLICT DO NOTHING;

-- Configuraciones del sistema
INSERT INTO system_config (key, value, data_type, description, is_public)
VALUES
    ('app_name', 'Sistema de Gestión de Transporte', 'string', 'Nombre de la aplicación', true),
    ('default_origin', 'Santiago', 'string', 'Ciudad de origen por defecto', false),
    ('insurance_threshold', '1000000', 'number', 'Valor mínimo para aplicar seguro', false),
    ('insurance_rate', '0.02', 'number', 'Porcentaje de seguro (2%)', false)
ON CONFLICT (key) DO NOTHING;

-- =========================================
-- VISTAS
-- =========================================

-- Vista: Resumen de órdenes
CREATE OR REPLACE VIEW v_orders_summary AS
SELECT
    o.id,
    o.order_number,
    o.created_at,
    o.status,
    c.business_name as customer_name,
    c.rut as customer_rut,
    o.total_packages,
    o.total_weight,
    o.declared_value,
    o.total_charge,
    o.destination,
    u.first_name || ' ' || u.last_name as created_by_name
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN users u ON o.created_by = u.id
ORDER BY o.created_at DESC;

-- Vista: Estado actual de bultos
CREATE OR REPLACE VIEW v_packages_current_status AS
SELECT
    p.id,
    p.package_number,
    p.order_id,
    o.order_number,
    p.description,
    p.weight,
    p.current_status,
    p.current_location,
    c.business_name as customer_name,
    o.destination
FROM packages p
JOIN orders o ON p.order_id = o.id
JOIN customers c ON o.customer_id = c.id
ORDER BY p.created_at DESC;

-- Vista: Carga pendiente de entrega
CREATE OR REPLACE VIEW v_pending_deliveries AS
SELECT
    p.id as package_id,
    p.package_number,
    o.order_number,
    c.business_name as customer_name,
    c.phone as customer_phone,
    p.weight,
    p.current_status,
    p.current_location,
    o.destination,
    p.created_at
FROM packages p
JOIN orders o ON p.order_id = o.id
JOIN customers c ON o.customer_id = c.id
WHERE p.current_status IN ('EN_BODEGA_DESTINO', 'LISTO_RETIRO')
ORDER BY p.created_at;

-- =========================================
-- FUNCIONES ÚTILES
-- =========================================

-- Función: Generar número de orden
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    new_number VARCHAR(50);
    year_part VARCHAR(4);
    month_part VARCHAR(2);
    sequence_part VARCHAR(6);
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    month_part := TO_CHAR(CURRENT_DATE, 'MM');

    SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0')
    INTO sequence_part
    FROM orders
    WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);

    new_number := 'OR-' || year_part || month_part || '-' || sequence_part;

    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Función: Generar número de bulto
CREATE OR REPLACE FUNCTION generate_package_number(p_order_number VARCHAR, p_sequence INTEGER)
RETURNS VARCHAR(50) AS $$
BEGIN
    RETURN p_order_number || '-P' || LPAD(p_sequence::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Función: Generar número de viaje
CREATE OR REPLACE FUNCTION generate_shipment_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    new_number VARCHAR(50);
    year_part VARCHAR(4);
    month_part VARCHAR(2);
    sequence_part VARCHAR(6);
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    month_part := TO_CHAR(CURRENT_DATE, 'MM');

    SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0')
    INTO sequence_part
    FROM shipments
    WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);

    new_number := 'SH-' || year_part || month_part || '-' || sequence_part;

    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- COMPLETADO
-- =========================================
-- Schema creado exitosamente
-- Total de tablas: 15
-- Total de índices: 40+
-- Total de triggers: 9
-- Total de funciones: 3
-- Total de vistas: 3
