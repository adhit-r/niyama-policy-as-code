import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';
import { connectDatabase } from './database/connection';
import { connectRedis } from './database/redis';
import { connectInfluxDB } from './database/influxdb';
import { connectElasticsearch } from './database/elasticsearch';

// Import routes
import authRoutes from './routes/auth';
import policyRoutes from './routes/policies';
import templateRoutes from './routes/templates';
import complianceRoutes from './routes/compliance';
import monitoringRoutes from './routes/monitoring';
import userRoutes from './routes/users';
import aiRoutes from './routes/ai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Niyama Policy as Code API',
      version: '1.0.0',
      description: 'Comprehensive Policy as Code platform with AI-powered policy generation and compliance mapping',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiter);

// API Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Niyama API Documentation',
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/policies', policyRoutes);
app.use('/api/v1/templates', templateRoutes);
app.use('/api/v1/compliance', complianceRoutes);
app.use('/api/v1/monitoring', monitoringRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/ai', aiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database connections and start server
async function startServer() {
  try {
    // Connect to databases
    await connectDatabase();
    await connectRedis();
    await connectInfluxDB();
    await connectElasticsearch();

    logger.info('All database connections established');

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Niyama Backend API running on port ${PORT}`);
      logger.info(`📚 API Documentation available at http://localhost:${PORT}/docs`);
      logger.info(`🏥 Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();

export default app;

