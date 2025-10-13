const path = require('path');

// Load test environment variables
require('dotenv').config({ 
  path: path.resolve(__dirname, '../../.env.test') 
});

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';
process.env.PORT = process.env.ORDER_SERVICE_PORT || 3003;

// Mock Prisma client for tests
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn().mockResolvedValue(),
    $disconnect: jest.fn().mockResolvedValue(),
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    customer: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
  }))
}));

// Global test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});