// Script rápido para insertar datos de prueba
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME || 'transport_db',
  user: process.env.DB_USER || 'transport_user',
  password: process.env.DB_PASSWORD || 'transport_password',
});

async function seedData() {
  const client = await pool.connect();

  try {
    console.log('🌱 Insertando datos de prueba...\n');

    // 1. Tarifas de Flete
    console.log('📦 Insertando tarifas de flete...');
    await client.query(`
      INSERT INTO freight_rates (route_name, origin, destination, rate_per_kg, min_charge, effective_from, is_active)
      VALUES
        ('Santiago - Coyhaique', 'Santiago', 'Coyhaique', 1500, 5000, '2025-01-01', true),
        ('Santiago - Punta Arenas', 'Santiago', 'Punta Arenas', 1800, 6000, '2025-01-01', true),
        ('Coyhaique - Puerto Montt', 'Coyhaique', 'Puerto Montt', 1200, 4000, '2025-01-01', true),
        ('Puerto Montt - Coyhaique', 'Puerto Montt', 'Coyhaique', 1300, 4500, '2025-01-01', true),
        ('Santiago - Puerto Montt', 'Santiago', 'Puerto Montt', 900, 3000, '2025-01-01', true)
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ 5 tarifas de flete insertadas\n');

    // 2. Configuración de Seguros
    console.log('🛡️  Insertando configuración de seguros...');
    await client.query(`
      INSERT INTO insurance_config (name, rate, min_value, is_active)
      VALUES
        ('Seguro Estándar 2025', 0.015, 50000, true)
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ 1 configuración de seguro insertada\n');

    console.log('✅ ¡Datos de prueba insertados exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedData();
