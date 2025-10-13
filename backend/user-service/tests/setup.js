const path = require('path');

// Load test environment variables
require('dotenv').config({ 
  path: path.resolve(__dirname, '../../.env.test') 
});

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';
process.env.PORT = process.env.USER_SERVICE_PORT || 3004;

// Mock Sequelize for tests
jest.mock('sequelize', () => {
  const SequelizeMock = jest.fn().mockImplementation(() => ({
    authenticate: jest.fn().mockResolvedValue(),
    sync: jest.fn().mockResolvedValue(),
    close: jest.fn().mockResolvedValue(),
  }));
  
  SequelizeMock.DataTypes = {
    STRING: 'STRING',
    INTEGER: 'INTEGER',
    BOOLEAN: 'BOOLEAN',
    DATE: 'DATE',
    UUID: 'UUID',
    UUIDV4: 'UUIDV4'
  };
  
  return SequelizeMock;
});

// Mock bcryptjs for password hashing tests
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt')
}));

// Global test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});