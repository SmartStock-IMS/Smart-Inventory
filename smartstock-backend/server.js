// Load environment variables first
require('dotenv').config();

const app = require('./src/app');
const config = require('./src/config/config');
const Logger = require('./src/utills/logger');
const pool = require('./src/config/database');

// Validate required environment variables
const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT', 
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  Logger.error('Missing required environment variables:', { missingVars });
  process.exit(1);
}

// Server instance
let server;

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  Logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Stop accepting new connections
    if (server) {
      server.close(() => {
        Logger.info('HTTP server closed');
      });
    }

    // Close database connections
    await pool.end();
    Logger.info('Database connections closed');

    // Close other resources (Redis, external APIs, etc.)
    // Add any other cleanup code here

    Logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    Logger.error('Error during shutdown:', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  Logger.error('Uncaught Exception - shutting down...', {
    error: err.message,
    stack: err.stack,
    name: err.name
  });
  
  // Close server gracefully
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Unhandled Rejection - shutting down...', {
    reason: reason,
    promise: promise
  });
  
  // Close server gracefully
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Database connection test and server startup
const startServer = async () => {
  try {
    // Test database connection
    Logger.info('Testing database connection...');
    Logger.info('Database connected successfully', {
      database: config.database.name,
      host: config.database.host
    });

    // Start HTTP server
    server = app.listen(config.port, () => {
      const serverInfo = {
        port: config.port,
        environment: config.nodeEnv,
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        pid: process.pid,
        timestamp: new Date().toISOString()
      };
      Logger.info('Server running successfully on', serverInfo.port);

      
    });

    // Configure server timeouts
    server.timeout = 30000; // 30 seconds
    server.keepAliveTimeout = 5000; // 5 seconds
    server.headersTimeout = 10000; // 10 seconds

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        Logger.error(`Port ${config.port} is already in use. Please choose a different port or stop the existing process.`);
      } else {
        Logger.error('Server error:', { error: error.message, code: error.code });
      }
      process.exit(1);
    });

    // Handle client errors
    server.on('clientError', (err, socket) => {
      Logger.warn('Client error:', { error: err.message });
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });

    return server;

  } catch (error) {
    Logger.error('Failed to start server:', {
      error: error.message,
      stack: error.stack,
      code: error.code
    });
    
    // Provide helpful error messages
    if (error.code === 'ECONNREFUSED') {
      Logger.error('Database connection refused. Please check:');
      Logger.error('1. PostgreSQL server is running');
      Logger.error('2. Database credentials are correct');
      Logger.error('3. Database exists and is accessible');
    }
    
    process.exit(1);
  }
};

// Performance monitoring (optional)
if (config.nodeEnv === 'production') {
  // Log memory usage every 30 seconds
  setInterval(() => {
    const usage = process.memoryUsage();
    const mbUsage = Object.keys(usage).reduce((acc, key) => {
      acc[key] = Math.round(usage[key] / 1024 / 1024 * 100) / 100 + ' MB';
      return acc;
    }, {});
    
    Logger.info('Memory usage:', mbUsage);
  }, 30000);
}

// Start the server
startServer().catch((error) => {
  Logger.error('Failed to initialize server:', { error: error.message });
  process.exit(1);
});

// Export for testing
module.exports = { server, startServer };