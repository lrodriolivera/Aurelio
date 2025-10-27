// =========================================
// Configuration Management
// =========================================

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
  // Server
  nodeEnv: string;
  port: number;
  apiUrl: string;

  // Database
  database: {
    url: string;
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    pool: {
      max: number;
      min: number;
    };
  };

  // Redis
  redis: {
    url: string;
    host: string;
    port: number;
    password?: string;
    db: number;
  };

  // JWT
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };

  // CORS
  cors: {
    origin: string | string[];
  };

  // File Upload
  upload: {
    maxSize: number;
    uploadDir: string;
  };

  // Integrations
  integrations: {
    whatsapp: {
      apiUrl?: string;
      apiToken?: string;
      phoneNumber?: string;
    };
    nubox: {
      apiUrl?: string;
      apiKey?: string;
      apiSecret?: string;
    };
  };

  // Email
  email: {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    from: string;
  };

  // Application Settings
  app: {
    defaultInsuranceRate: number;
    minInsuranceValue: number;
    defaultFreightRate: number;
  };

  // Logging
  logging: {
    level: string;
    dir: string;
  };
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiUrl: process.env.API_URL || 'http://localhost:3000',

  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/transport_db',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'transport_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
    },
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:5173', 'http://localhost:5174'],
  },

  upload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },

  integrations: {
    whatsapp: {
      apiUrl: process.env.WHATSAPP_API_URL,
      apiToken: process.env.WHATSAPP_API_TOKEN,
      phoneNumber: process.env.WHATSAPP_PHONE_NUMBER,
    },
    nubox: {
      apiUrl: process.env.NUBOX_API_URL,
      apiKey: process.env.NUBOX_API_KEY,
      apiSecret: process.env.NUBOX_API_SECRET,
    },
  },

  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'noreply@transport.com',
  },

  app: {
    defaultInsuranceRate: parseFloat(process.env.DEFAULT_INSURANCE_RATE || '0.02'),
    minInsuranceValue: parseFloat(process.env.MIN_INSURANCE_VALUE || '1000000'),
    defaultFreightRate: parseFloat(process.env.DEFAULT_FREIGHT_RATE || '500'),
  },

  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    dir: process.env.LOG_DIR || './logs',
  },
};

// Validate critical configuration
const validateConfig = (): void => {
  const errors: string[] = [];

  if (config.nodeEnv === 'production') {
    if (config.jwt.secret === 'your-super-secret-jwt-key-change-in-production') {
      errors.push('JWT_SECRET must be changed in production');
    }
    if (config.jwt.refreshSecret === 'your-super-secret-refresh-key-change-in-production') {
      errors.push('JWT_REFRESH_SECRET must be changed in production');
    }
    if (!config.database.url) {
      errors.push('DATABASE_URL is required in production');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
};

validateConfig();

export default config;
