// Script para insertar datos de prueba completos
const { Pool } = require('pg');

// Usar DATABASE_PUBLIC_URL para conexión desde fuera de Railway
const connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

const pool = connectionString
  ? new Pool({ connectionString })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5433'),
      database: process.env.DB_NAME || 'transport_db',
      user: process.env.DB_USER || 'transport_user',
      password: process.env.DB_PASSWORD || 'transport_password',
    });

async function seedData() {
  const client = await pool.connect();

  try {
    console.log('🌱 Iniciando inserción de datos de prueba...\n');

    // 1. Tarifas de Flete
    console.log('📦 Insertando tarifas de flete...');
    await client.query(`
      INSERT INTO freight_rates (origin, destination, rate_per_kg, minimum_charge, effective_date, is_active)
      VALUES
        ('Santiago', 'Coyhaique', 1500, 5000, '2025-01-01', true),
        ('Santiago', 'Punta Arenas', 1800, 6000, '2025-01-01', true),
        ('Coyhaique', 'Puerto Montt', 1200, 4000, '2025-01-01', true),
        ('Puerto Montt', 'Coyhaique', 1300, 4500, '2025-01-01', true),
        ('Santiago', 'Puerto Montt', 900, 3000, '2025-01-01', true)
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ 5 tarifas de flete insertadas\n');

    // 2. Configuración de Seguros
    console.log('🛡️  Insertando configuración de seguros...');
    await client.query(`
      INSERT INTO insurance (min_value, max_value, rate_percentage, minimum_premium, effective_date, is_active)
      VALUES
        (50000, 10000000, 1.5, 1000, '2025-01-01', true)
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ 1 configuración de seguro insertada\n');

    // 3. Clientes de Prueba
    console.log('👥 Insertando clientes de prueba...');
    const customersResult = await client.query(`
      INSERT INTO customers (rut, business_name, contact_name, email, phone, address, city)
      VALUES
        ('76.123.456-7', 'Empresa Transportes del Sur', 'Juan Pérez', 'contacto@transportesdelsur.cl', '+56912345678', 'Av. Libertador Bernardo O''Higgins 1234', 'Santiago'),
        ('77.234.567-8', 'Comercial La Patagonia SpA', 'María González', 'ventas@patagonia.cl', '+56987654321', 'Calle Arturo Prat 567', 'Coyhaique'),
        ('78.345.678-9', 'Distribuidora Magallanes', 'Pedro Sánchez', 'logistica@magallanes.cl', '+56911223344', 'Av. Colón 890', 'Punta Arenas'),
        ('79.456.789-0', 'Supermercado Los Andes', 'Ana Martínez', 'compras@losandes.cl', '+56922334455', 'Av. Los Andes 1500', 'Puerto Montt'),
        ('76.567.890-1', 'Ferretería El Constructor', 'Carlos López', 'info@elconstructor.cl', '+56933445566', 'Calle Cochrane 234', 'Coyhaique'),
        ('77.678.901-2', 'Librería y Papelería Mundial', 'Laura Torres', 'ventas@mundial.cl', '+56944556677', 'Av. Bulnes 678', 'Santiago'),
        ('78.789.012-3', 'Restorán Sabores del Sur', 'Roberto Díaz', 'administracion@sabores.cl', '+56955667788', 'Calle Baquedano 345', 'Puerto Montt'),
        ('79.890.123-4', 'Farmacia Cruz Verde Austral', 'Carmen Silva', 'logistica@cruzverde.cl', '+56966778899', 'Av. Balmaceda 123', 'Coyhaique'),
        ('76.901.234-5', 'Tienda de Ropa Elegancia', 'Miguel Rojas', 'contacto@elegancia.cl', '+56977889900', 'Calle Maipú 456', 'Punta Arenas'),
        ('77.012.345-6', 'Electrónica y Computación TecnoSur', 'Isabel Vargas', 'ventas@tecnosur.cl', '+56988990011', 'Av. Colón 789', 'Santiago')
      ON CONFLICT (rut) DO NOTHING
      RETURNING id, business_name
    `);
    console.log(`✅ ${customersResult.rowCount} clientes insertados\n`);

    // Obtener IDs de clientes para usar en pedidos
    const customersData = await client.query('SELECT id FROM customers LIMIT 10');
    const customerIds = customersData.rows.map(row => row.id);

    if (customerIds.length === 0) {
      console.log('⚠️  No hay clientes disponibles, obteniendo IDs existentes...');
      const existingCustomers = await client.query('SELECT id FROM customers ORDER BY created_at DESC LIMIT 10');
      customerIds.push(...existingCustomers.rows.map(row => row.id));
    }

    if (customerIds.length === 0) {
      throw new Error('No hay clientes en la base de datos');
    }

    // 4. Pedidos de Prueba
    console.log('📋 Insertando pedidos de prueba...');
    const ordersResult = await client.query(`
      INSERT INTO orders (
        order_number, customer_id,
        origin, destination,
        total_weight, total_packages, declared_value,
        freight_charge, insurance_charge, total_charge,
        notes
      )
      VALUES
        ('ORD-2025-001', $1, 'Santiago', 'Coyhaique', 25.5, 3, 500000, 38250, 7500, 45750, 'Envío urgente'),
        ('ORD-2025-002', $2, 'Santiago', 'Punta Arenas', 15.0, 2, 300000, 27000, 4500, 31500, 'Mercancía frágil'),
        ('ORD-2025-003', $3, 'Coyhaique', 'Puerto Montt', 40.0, 5, 800000, 48000, 12000, 60000, 'Cliente preferencial'),
        ('ORD-2025-004', $4, 'Puerto Montt', 'Coyhaique', 30.0, 4, 600000, 39000, 9000, 48000, ''),
        ('ORD-2025-005', $5, 'Santiago', 'Puerto Montt', 50.0, 6, 1000000, 45000, 15000, 60000, 'Materiales de construcción'),
        ('ORD-2025-006', $6, 'Santiago', 'Coyhaique', 20.0, 2, 400000, 30000, 6000, 36000, 'Papelería'),
        ('ORD-2025-007', $7, 'Puerto Montt', 'Coyhaique', 35.0, 4, 700000, 45500, 10500, 56000, 'Alimentos perecibles'),
        ('ORD-2025-008', $8, 'Coyhaique', 'Puerto Montt', 18.0, 2, 350000, 21600, 5250, 26850, 'Medicamentos - Manejo especial'),
        ('ORD-2025-009', $9, 'Santiago', 'Punta Arenas', 45.0, 5, 900000, 81000, 13500, 94500, 'Ropa de temporada'),
        ('ORD-2025-010', $10, 'Santiago', 'Coyhaique', 28.0, 3, 550000, 42000, 8250, 50250, 'Equipos electrónicos')
      ON CONFLICT (order_number) DO NOTHING
      RETURNING id, order_number
    `,
      customerIds.slice(0, 10)
    );
    console.log(`✅ ${ordersResult.rowCount} pedidos insertados\n`);

    // 5. Paquetes de Prueba
    console.log('📦 Insertando paquetes de prueba...');
    const orders = await client.query(`
      SELECT id, order_number, total_packages FROM orders
      WHERE order_number LIKE 'ORD-2025-%'
      ORDER BY order_number
      LIMIT 10
    `);

    let packageCount = 0;
    const statuses = ['RECIBIDO', 'EN_BODEGA_ORIGEN', 'EN_TRANSITO_PUERTO', 'EN_BODEGA_PUERTO', 'EN_TRANSITO_DESTINO', 'ENTREGADO'];

    for (const order of orders.rows) {
      for (let i = 1; i <= order.total_packages; i++) {
        const packageNumber = `${order.order_number}-PKG${String(i).padStart(2, '0')}`;
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        await client.query(`
          INSERT INTO packages (order_id, package_number, weight, description, current_status)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (package_number) DO NOTHING
        `, [
          order.id,
          packageNumber,
          (Math.random() * 20 + 5).toFixed(2),
          `Paquete ${i} del pedido ${order.order_number}`,
          status
        ]);
        packageCount++;
      }
    }
    console.log(`✅ ${packageCount} paquetes insertados\n`);

    // 6. Envíos de Prueba
    console.log('🚚 Insertando envíos de prueba...');
    const shipmentData = [
      { number: 'SHIP-2025-001', destination: 'Coyhaique', carrier: 'Transportes del Sur', plate: 'ABCD12', driver: 'Juan Pérez', phone: '+56912345678', status: 'IN_TRANSIT' },
      { number: 'SHIP-2025-002', destination: 'Punta Arenas', carrier: 'Cargo Express', plate: 'EFGH34', driver: 'María González', phone: '+56987654321', status: 'IN_TRANSIT' },
      { number: 'SHIP-2025-003', destination: 'Puerto Montt', carrier: 'Patagonia Logistics', plate: 'IJKL56', driver: 'Pedro Sánchez', phone: '+56911223344', status: 'DELIVERED' }
    ];

    for (const ship of shipmentData) {
      await client.query(`
        INSERT INTO shipments (shipment_number, destination, carrier, vehicle_plate, driver_name, driver_phone, status, total_packages, total_weight)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (shipment_number) DO NOTHING
      `, [
        ship.number,
        ship.destination,
        ship.carrier,
        ship.plate,
        ship.driver,
        ship.phone,
        ship.status,
        Math.floor(Math.random() * 10 + 5),
        (Math.random() * 200 + 50).toFixed(2)
      ]);
    }
    console.log(`✅ ${shipmentData.length} envíos insertados\n`);

    console.log('✅ ¡Todos los datos de prueba insertados exitosamente!\n');
    console.log('📊 Resumen:');
    console.log('   - Tarifas de flete: 5');
    console.log('   - Seguros: 1');
    console.log('   - Clientes: 10');
    console.log('   - Pedidos: 10');
    console.log('   - Paquetes:', packageCount);
    console.log('   - Envíos: 3');
    console.log('\n🎉 ¡Base de datos lista para demostración!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedData();
