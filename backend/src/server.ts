// =========================================
// Main Server File
// Express Application Setup
// =========================================

import express, { Application } from 'express';
import cors from 'cors';
import config from './config';
import database from './config/database';
import redis from './config/redis';
import logger from './utils/logger';
import { errorHandler, notFound } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import customerRoutes from './routes/customer.routes';
import orderRoutes from './routes/order.routes';
import shipmentRoutes from './routes/shipment.routes';
import trackingRoutes from './routes/tracking.routes';
import deliveryRoutes from './routes/delivery.routes';
import reportRoutes from './routes/report.routes';
import freightRateRoutes from './routes/freightRate.routes';
import insuranceRoutes from './routes/insurance.routes';
import hardwareRoutes from './routes/hardware.routes';

class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = config.port;
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // CORS - Allow multiple origins from config
    this.app.use(
      cors({
        origin: config.cors.origin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        optionsSuccessStatus: 200,
      })
    );

    // Body parsers
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      logger.debug(`${req.method} ${req.path}`, {
        query: req.query,
        ip: req.ip,
      });
      next();
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
      });
    });
  }

  private initializeRoutes(): void {
    // API Routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/customers', customerRoutes);
    this.app.use('/api/orders', orderRoutes);
    this.app.use('/api/shipments', shipmentRoutes);
    this.app.use('/api/tracking', trackingRoutes);
    this.app.use('/api/deliveries', deliveryRoutes);
    this.app.use('/api/reports', reportRoutes);
    this.app.use('/api/freight-rates', freightRateRoutes);
    this.app.use('/api/insurance', insuranceRoutes);
    this.app.use('/api/hardware', hardwareRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'Sistema de Gestión de Transporte API',
        version: '1.0.0',
        status: 'running',
        documentation: '/api/docs',
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFound);

    // Global error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to Redis
      await redis.connect();
      logger.info('✓ Redis connected');

      // Test database connection
      const dbResult = await database.query('SELECT NOW()');
      logger.info('✓ Database connected:', dbResult.rows[0].now);

      // Start server
      this.app.listen(this.port, () => {
        logger.info(`🚀 Server running on port ${this.port}`);
        logger.info(`📍 Environment: ${config.nodeEnv}`);
        logger.info(`🔗 API URL: ${config.apiUrl}`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public getApp(): Application {
    return this.app;
  }
}

// Create and start server
const server = new Server();
server.start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await database.close();
  await redis.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await database.close();
  await redis.disconnect();
  process.exit(0);
});

export default server;
