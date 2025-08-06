const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/config');
const errorHandler = require('./middleware/errorHandler');
const Logger = require('./utills/logger');

// Import all routes
const authRoutes = require('./routes/authRoutes');
//const userRoutes = require('./routes/users');
//const productRoutes = require('./routes/products');
//const customerRoutes = require('./routes/customers');
//const supplierRoutes = require('./routes/suppliers');
//const orderRoutes = require('./routes/orders');
//const purchaseOrderRoutes = require('./routes/purchase-orders');
//const invoiceRoutes = require('./routes/invoices');
//const inventoryRoutes = require('./routes/inventory');
//const resourceRoutes = require('./routes/resources');
//const analyticsRoutes = require('./routes/analytics');
//const categoryRoutes = require('./routes/categories');
//const unitRoutes = require('./routes/units');

const app = express();

// Trust proxy (for production behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3001', // React dev server
      'http://localhost:5173', // Vite dev server
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => Logger.info(message.trim())
    }
  }));
}

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  strict: true
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 1000
}));

// Static files (for uploads, etc.)
//app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware (custom)
app.use((req, res, next) => {
  // Log request details in development
  if (config.nodeEnv === 'development') {
    Logger.debug('Request received', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  }
  
  // Add request ID for tracking
  req.requestId = require('uuid').v4();
  res.setHeader('X-Request-ID', req.requestId);
  
  next();
});

// Health check endpoint (before routes)
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
    memory: process.memoryUsage(),
    requestId: req.requestId,
  };

  res.status(200).json(healthCheck);
});

// API version info
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'SmartStock API',
    version: '1.0.0',
    environment: config.nodeEnv,
    documentation: config.nodeEnv === 'development' ? '/api-docs' : null,
    endpoints: {
      auth: '/api/auth',
      //users: `${config.apiPrefix}/users`,
      //products: `${config.apiPrefix}/products`,
      //customers: `${config.apiPrefix}/customers`,
      //suppliers: `${config.apiPrefix}/suppliers`,
      //orders: `${config.apiPrefix}/orders`,
      //'purchase-orders': `${config.apiPrefix}/purchase-orders`,
      //invoices: `${config.apiPrefix}/invoices`,
      //inventory: `${config.apiPrefix}/inventory`,
      //resources: `${config.apiPrefix}/resources`,
      //analytics: `${config.apiPrefix}/analytics`,
      //categories: `${config.apiPrefix}/categories`,
      //units: `${config.apiPrefix}/units`,
    },
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);


// Route not found handler
app.use('*', (req, res) => {
  Logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.requestId
  });

  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    error: 'Not Found',
    statusCode: 404,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    availableRoutes: {
      auth: '/api/auth',
      health: '/health',
      api: '/api',
      documentation: config.nodeEnv === 'development' ? '/api-docs' : 'Not available in production'
    }
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Handle unhandled promise rejections within routes
process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Unhandled Rejection at Promise', {
    reason: reason,
    promise: promise
  });
});

module.exports = app;