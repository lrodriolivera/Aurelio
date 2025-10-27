// =========================================
// Database Fresh Migration Script
// Drops all tables and recreates from scratch
// USE WITH CAUTION - THIS DELETES ALL DATA!
// =========================================

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runFreshMigration() {
  console.log('🚨 Starting FRESH database migration...');
  console.log('⚠️  WARNING: This will DELETE ALL existing data!');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Drop all tables
    console.log('🗑️  Dropping all existing tables...');
    await client.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO PUBLIC;
    `);
    console.log('✅ All tables dropped');

    // Create fresh schema
    console.log('📋 Running schema.sql...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schemaSQL);
    console.log('✅ Schema created successfully');

    // Insert seed data
    console.log('🌱 Running seed.sql...');
    const seedSQL = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await client.query(seedSQL);
    console.log('✅ Seed data inserted successfully');

    console.log('🎉 Fresh migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Full error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run migration
runFreshMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
