# Backend Testing Setup Guide

This guide explains how to run tests for the SmartStock Backend microservices.

## Architecture

The backend consists of 4 microservices:
- **API Gateway** (Port 3001) - Routes and proxies requests
- **Inventory Service** (Port 3002) - Manages products and inventory
- **Order Service** (Port 3003) - Handles orders and customers
- **User Service** (Port 3004) - Manages authentication and users

## Testing Framework

Each microservice uses **Jest** with **Supertest** for API testing:
- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertion library for testing APIs
- **@types/jest**: TypeScript definitions for Jest

## Quick Start

### 1. Install Dependencies

From the backend root directory:
```bash
cd backend
npm run install:all
```

Or install for individual services:
```bash
cd api-gateway && npm install
cd inventory-service && npm install
cd order-service && npm install
cd user-service && npm install
```

### 2. Run All Tests

```bash
# From backend root directory
npm test

# Or run individual service tests
npm run test:api-gateway
npm run test:inventory
npm run test:order
npm run test:user
```

### 3. Run Tests for Individual Services

```bash
# API Gateway
cd api-gateway
npm test

# Inventory Service
cd inventory-service
npm test

# Order Service
cd order-service
npm test

# User Service
cd user-service
npm test
```

### 4. Generate Coverage Reports

```bash
# All services
npm run test:coverage

# Individual services
cd api-gateway && npm run test:coverage
cd inventory-service && npm run test:coverage
cd order-service && npm run test:coverage
cd user-service && npm run test:coverage
```

## Test Environment Configuration

Each service uses test environment variables from `.env.test`:

```
NODE_ENV=test
DB_NAME=smartstock_test
DB_USER=postgres
DB_PASSWORD=your_test_password
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=test_jwt_secret_key_for_microservices_123456789
```

**Important**: Update the test database credentials in `.env.test` before running tests.

## Test Structure

### Directory Structure
```
service-name/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── services/
├── tests/
│   ├── setup.js          # Test configuration
│   ├── controller.test.js # Controller tests
│   └── service.test.js    # Service tests
├── jest.config.js         # Jest configuration
└── package.json
```

### Example Test File

```javascript
const controller = require('../src/controllers/exampleController');

describe('ExampleController', () => {
  let req, res;
  
  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });
  
  test('should handle valid request', async () => {
    // Arrange
    req.body = { data: 'test' };
    
    // Act
    await controller.method(req, res);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });
});
```

## Available Test Scripts

### Root Level (backend/)
- `npm test` - Run all microservice tests
- `npm run test:coverage` - Generate coverage for all services
- `npm run install:all` - Install dependencies for all services

### Service Level
- `npm test` - Run tests for the service
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

## Mocking Strategy

### Database Mocking
- **Sequelize**: Mocked in setup.js for Inventory and User services
- **Prisma**: Mocked in setup.js for Order service

### External Service Mocking
- **Cloudinary**: Mocked for image upload tests
- **bcryptjs**: Mocked for password hashing tests
- **JWT**: Mocked for authentication tests

## Writing New Tests

### 1. Controller Tests
Test HTTP request/response handling:
```javascript
test('should return 400 for invalid input', async () => {
  req.body = { invalid: 'data' };
  await controller.method(req, res);
  expect(res.status).toHaveBeenCalledWith(400);
});
```

### 2. Service Tests
Test business logic:
```javascript
test('should process data correctly', async () => {
  const result = await service.processData(inputData);
  expect(result).toEqual(expectedOutput);
});
```

### 3. Integration Tests
Test API endpoints:
```javascript
test('GET /api/endpoint should return data', async () => {
  const response = await request(app)
    .get('/api/endpoint')
    .expect(200);
  
  expect(response.body).toHaveProperty('data');
});
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure test database credentials are correct in `.env.test`
   - Check if PostgreSQL is running

2. **Module Not Found Errors**
   - Run `npm install` in the service directory
   - Check file paths in require statements

3. **Jest Timeout Errors**
   - Increase timeout in `jest.config.js`
   - Check for hanging promises or database connections

4. **Mock Issues**
   - Clear mocks between tests: `jest.clearAllMocks()`
   - Check mock implementations in `setup.js`

### Test Database Setup

Create a test database:
```sql
CREATE DATABASE smartstock_test;
```

Update `.env.test` with your credentials:
```
DB_NAME=smartstock_test
DB_USER=your_username
DB_PASSWORD=your_password
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Mocking**: Mock external dependencies
3. **Coverage**: Aim for >80% code coverage
4. **Naming**: Use descriptive test names
5. **Structure**: Follow AAA pattern (Arrange, Act, Assert)

## Continuous Integration

Add to your CI/CD pipeline:
```yaml
- name: Run Backend Tests
  run: |
    cd backend
    npm run install:all
    npm test
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Node.js Testing Best Practices](https://github.com/goldbergyoni/nodejs-best-practices#-6-testing-and-overall-quality-practices)