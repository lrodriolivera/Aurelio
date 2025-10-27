// =========================================
// PostgreSQL Database Connection
// Singleton Pattern
// =========================================

import { Pool, PoolClient, QueryResult } from 'pg';
import config from './index';
import logger from '../utils/logger';

class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      connectionString: config.database.url,
      max: config.database.pool.max,
      min: config.database.pool.min,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    this.pool.on('connect', () => {
      logger.info('New database connection established');
    });

    this.pool.on('error', (err: Error) => {
      logger.error('Unexpected database error:', err);
    });

    // Test connection
    this.testConnection();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private async testConnection(): Promise<void> {
    try {
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      logger.info('Database connection successful:', result.rows[0]);
      client.release();
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  public async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      logger.debug('Executed query', { text, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      logger.error('Query error:', { text, error });
      throw error;
    }
  }

  public async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  public async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
    logger.info('Database pool has been closed');
  }

  public getPool(): Pool {
    return this.pool;
  }
}

// Export singleton instance
export default Database.getInstance();
