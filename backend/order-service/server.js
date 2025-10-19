const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const orderRoutes = require('./src/routes/orderRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
// const quotationRoutes = require('./src/routes/quotationRoutes');
 const reportRoutes = require('./src/routes/reportRoutes');
const supplierRoutes = require('./src/routes/supplierRoutes'); // + add

const app = express();
const PORT = process.env.PORT || 3003;

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: [
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
    service: 'Order Service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/orders', orderRoutes);
app.use('/customers', customerRoutes);
// app.use('/quotations', quotationRoutes);
 app.use('/reports', reportRoutes);
app.use('/suppliers', supplierRoutes); // + add

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    service: 'Order Service'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Order Service Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    service: 'Order Service'
  });
});

app.listen(PORT, () => {
  console.log(`🛒 Order Service running on port ${PORT}`);
});

module.exports = app;
