const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow frontend and gateway origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-User-Role'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'sem5-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'API Gateway',
    version: '1.0.0'
  });
});

// Service URLs
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';

// Proxy configurations
const createProxy = (target, pathRewrite = {}) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    timeout: 30000, // 30 seconds timeout
    proxyTimeout: 30000,
    onError: (err, req, res) => {
      console.error(`Proxy error for ${target}:`, err.message);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Service temporarily unavailable',
          error: 'Internal Server Error'
        });
      }
    },
    onProxyReq: (proxyReq, req, res) => {
      // Forward user information to microservices
      if (req.user) {
        // Handle both 'id' and 'UserID' field naming conventions
        const userId = req.user.id || req.user.UserID;
        const userRole = req.user.role;
        
        if (userId) {
          proxyReq.setHeader('X-User-ID', String(userId));
        }
        if (userRole) {
          proxyReq.setHeader('X-User-Role', String(userRole));
        }
      }
      
      // Fix content-length for body parsing
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Handle response timeout
      proxyRes.on('timeout', () => {
        console.error('Proxy response timeout');
        if (!res.headersSent) {
          res.status(504).json({
            success: false,
            message: 'Gateway timeout',
            error: 'Service response timeout'
          });
        }
      });
    }
  });
};

// Routes that don't require authentication
const authProxy = createProxyMiddleware({
  target: USER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/auth' },
  timeout: 30000,
  proxyTimeout: 30000,
  parseReqBody: false, // Let the target service handle body parsing
  onError: (err, req, res) => {
    console.error(`Auth proxy error:`, err.message);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Authentication service unavailable',
        error: 'Internal Server Error'
      });
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    // Handle POST requests with body
    if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  }
});

app.use('/api/auth/login', authProxy);
app.use('/api/auth/register', authProxy);
app.use('/api/auth/refresh', authProxy);
app.use('/api/auth/validate', authProxy);
app.use('/api/auth/check-users', authProxy); // Public endpoint to check if users exist

// Protected routes
// user service routes
app.use('/api/auth', authenticateToken, createProxy(USER_SERVICE_URL, { '^/api/auth': '/auth' }));
app.use('/api/users', authenticateToken, createProxy(USER_SERVICE_URL, { '^/api/users': '/users' }));
app.use('/api/salesrep', authenticateToken, createProxy(USER_SERVICE_URL, { '^/api/salesrep': '/salesstaff' }));
app.use('/api/resource-managers', authenticateToken, createProxy(USER_SERVICE_URL, { '^/api/resource-managers': '/users/resource-managers' }));

// inventory service routes
app.use('/api/products', authenticateToken, createProxy(INVENTORY_SERVICE_URL, { '^/api/products': '/products' }));
app.use('/api/inventory', authenticateToken, createProxy(INVENTORY_SERVICE_URL, { '^/api/inventory': '/inventory' }));
app.use('/api/categories', authenticateToken, createProxy(INVENTORY_SERVICE_URL, { '^/api/categories': '/categories' }));

// order service routes
app.use('/api/orders', authenticateToken, createProxy(ORDER_SERVICE_URL, { '^/api/orders': '/orders' }));
app.use('/api/customers', authenticateToken, createProxy(ORDER_SERVICE_URL, { '^/api/customers': '/customers' }));
app.use('/api/quotations', authenticateToken, createProxy(ORDER_SERVICE_URL, { '^/api/quotations': '/quotations' }));
app.use('/api/reports', authenticateToken, createProxy(ORDER_SERVICE_URL, { '^/api/reports': '/reports' }));

// Dashboard routes (aggregate data from multiple services)
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    // This would typically aggregate data from multiple services
    res.status(200).json({
      success: true,
      message: 'Dashboard endpoint - implement aggregation logic',
      data: {
        totalProducts: 0,
        totalOrders: 0,
        totalCustomers: 0,
        revenue: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Dashboard data unavailable',
      error: error.message
    });
  }
});

// API documentation
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'SmartStock API Gateway',
    version: '1.0.0',
    services: {
      'user-service': USER_SERVICE_URL,
      'inventory-service': INVENTORY_SERVICE_URL,
      'order-service': ORDER_SERVICE_URL
    },
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      salesrep: '/api/salesrep',
      'resource-managers': '/api/resource-managers',
      products: '/api/products',
      inventory: '/api/inventory',
      orders: '/api/orders',
      customers: '/api/customers',
      quotations: '/api/quotations',
      reports: '/api/reports',
      dashboard: '/api/dashboard'
    },
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    error: 'Not Found'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Gateway Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📋 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;
