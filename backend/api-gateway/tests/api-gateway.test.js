const request = require('supertest');
const express = require('express');

// Mock the API Gateway app
const createApp = () => {
  const app = express();
  
  // Basic middleware
  app.use(express.json());
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'API Gateway'
    });
  });
  
  // Test endpoint
  app.get('/api/test', (req, res) => {
    res.status(200).json({ message: 'API Gateway is working' });
  });
  
  return app;
};

describe('API Gateway', () => {
  let app;
  
  beforeEach(() => {
    app = createApp();
  });
  
  describe('Health Check', () => {
    test('GET /health should return 200 and status OK', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('service', 'API Gateway');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
  
  describe('Test Endpoint', () => {
    test('GET /api/test should return success message', async () => {
      const response = await request(app)
        .get('/api/test')
        .expect(200);
      
      expect(response.body).toHaveProperty('message', 'API Gateway is working');
    });
  });
  
  describe('Error Handling', () => {
    test('should return 404 for non-existent routes', async () => {
      await request(app)
        .get('/non-existent-route')
        .expect(404);
    });
  });
});