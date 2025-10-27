// =========================================
// Database Migration Script for Railway
// Executes schema.sql and seed.sql
// =========================================

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Starting database migration...');

  // Create client with DATABASE_URL from Railway
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // Connect to database
    await client.connect();
    console.log('✅ Connected to database');

    // Check if tables already exist
    const checkResult = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'users'
    `);

    const tablesExist = parseInt(checkResult.rows[0].count) > 0;

    if (tablesExist) {
      console.log('⚠️  Tables already exist, skipping schema creation');
      console.log('ℹ️  To recreate schema, manually drop tables first');
    } else {
      // Read and execute schema.sql
      console.log('📋 Running schema.sql...');
      const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      await client.query(schemaSQL);
      console.log('✅ Schema created successfully');

      // Read and execute seed.sql
      console.log('🌱 Running seed.sql...');
      const seedSQL = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
      await client.query(seedSQL);
      console.log('✅ Seed data inserted successfully');
    }

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Full error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run migration
runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
