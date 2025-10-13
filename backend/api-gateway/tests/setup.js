const path = require('path');

// Load test environment variables
require('dotenv').config({ 
  path: path.resolve(__dirname, '../.env.test') 
});

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT || 3001;

// Global test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});