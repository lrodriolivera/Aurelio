-- =========================================
-- Transport Management System - Database Schema
-- Railway Deployment Script
-- =========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- USERS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'operator', 'driver')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- CUSTOMERS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rut VARCHAR(20) UNIQUE NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- ORDERS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    declared_value DECIMAL(12, 2) NOT NULL,
    freight_charge DECIMAL(10, 2) NOT NULL,
    insurance_charge DECIMAL(10, 2) DEFAULT 0,
    total_charge DECIMAL(12, 2) NOT NULL,
    total_weight DECIMAL(10, 2) NOT NULL,
    total_packages INTEGER NOT NULL,
    special_instructions TEXT,
    notes TEXT,
    reception_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- PACKAGES TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    package_number VARCHAR(50) UNIQUE NOT NULL,
    weight DECIMAL(10, 2) NOT NULL,
    length DECIMAL(10, 2),
    width DECIMAL(10, 2),
    height DECIMAL(10, 2),
    description TEXT,
    current_status VARCHAR(50) NOT NULL DEFAULT 'RECIBIDO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (current_status IN (
        'RECIBIDO',
        'EN_BODEGA_ORIGEN',
        'EN_TRANSITO_PUERTO',
        'EN_BODEGA_PUERTO',
        'EN_TRANSITO_DESTINO',
        'EN_BODEGA_DESTINO',
        'LISTO_RETIRO',
        'ENTREGADO'
    ))
);

-- =========================================
-- SHIPMENTS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_number VARCHAR(50) UNIQUE NOT NULL,
    destination VARCHAR(255) NOT NULL,
    carrier VARCHAR(255),
    vehicle_plate VARCHAR(20),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNING',
    total_packages INTEGER DEFAULT 0,
    scanned_packages INTEGER DEFAULT 0,
    total_weight DECIMAL(10, 2) DEFAULT 0,
    estimated_departure TIMESTAMP,
    actual_departure TIMESTAMP,
    estimated_arrival TIMESTAMP,
    actual_arrival TIMESTAMP,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (status IN ('PLANNING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED'))
);

-- =========================================
-- SHIPMENT_PACKAGES TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS shipment_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scanned_by UUID REFERENCES users(id),
    UNIQUE(shipment_id, package_id)
);

-- =========================================
-- PACKAGE_STATUS_HISTORY TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS package_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    notes TEXT,
    changed_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- DELIVERIES TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES packages(id),
    delivery_type VARCHAR(50) NOT NULL CHECK (delivery_type IN ('ENTREGA_DOMICILIO', 'RETIRO_SUCURSAL')),
    recipient_name VARCHAR(255) NOT NULL,
    recipient_rut VARCHAR(20),
    recipient_phone VARCHAR(50),
    delivery_address TEXT,
    delivery_city VARCHAR(100),
    delivery_notes TEXT,
    signature_image TEXT,
    delivered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- FREIGHT_RATES TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS freight_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    rate_per_kg DECIMAL(10, 2) NOT NULL,
    minimum_charge DECIMAL(10, 2) NOT NULL,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- INSURANCE TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS insurance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    min_value DECIMAL(12, 2) NOT NULL,
    max_value DECIMAL(12, 2),
    rate_percentage DECIMAL(5, 2) NOT NULL,
    minimum_premium DECIMAL(10, 2) NOT NULL,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- INDEXES FOR PERFORMANCE
-- =========================================
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_packages_order_id ON packages(order_id);
CREATE INDEX IF NOT EXISTS idx_packages_package_number ON packages(package_number);
CREATE INDEX IF NOT EXISTS idx_packages_current_status ON packages(current_status);
CREATE INDEX IF NOT EXISTS idx_shipment_packages_shipment_id ON shipment_packages(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_packages_package_id ON shipment_packages(package_id);
CREATE INDEX IF NOT EXISTS idx_package_status_history_package_id ON package_status_history(package_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_package_id ON deliveries(package_id);
CREATE INDEX IF NOT EXISTS idx_freight_rates_origin_destination ON freight_rates(origin, destination);

-- =========================================
-- TRIGGERS FOR UPDATED_AT
-- =========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_packages_updated_at ON packages;
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shipments_updated_at ON shipments;
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_freight_rates_updated_at ON freight_rates;
CREATE TRIGGER update_freight_rates_updated_at BEFORE UPDATE ON freight_rates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_insurance_updated_at ON insurance;
CREATE TRIGGER update_insurance_updated_at BEFORE UPDATE ON insurance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
