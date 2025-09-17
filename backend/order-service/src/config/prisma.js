// Import the main Prisma client from the backend folder
// First, we need to generate the client from the main backend schema
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Create Prisma client instance using the main schema
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Handle connection events
prisma.$connect()
  .then(() => {
    console.log('✅ Order Service connected to database via Prisma client');
  })
  .catch((error) => {
    console.error('❌ Order Service failed to connect to database:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Order Service disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Order Service disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = prisma;