const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const productRoutes = require('./src/routes/productRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.GATEWAY_URL // Vite frontend
  ],
  credentials: true

}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Inventory Service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
//app.use('/inventory', inventoryRoutes);
app.use('/resources', inventoryRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    service: 'Inventory Service'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Inventory Service Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    service: 'Inventory Service'
  });
});

app.listen(PORT, () => {
  console.log(`📦 Inventory Service running on port ${PORT}`);
});

module.exports = app;
