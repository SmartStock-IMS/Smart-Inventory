const authController = require('../src/controllers/authController');
const authService = require('../src/services/authService');
const { validationResult } = require('express-validator');

// Mock the auth service
jest.mock('../src/services/authService');
jest.mock('express-validator');

describe('AuthController', () => {
  let req, res;
  
  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    // Mock validation result to return no errors by default
    validationResult.mockReturnValue({
      isEmpty: jest.fn().mockReturnValue(true),
      array: jest.fn().mockReturnValue([])
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('login', () => {
    test('should login successfully with valid credentials', async () => {
      // Arrange
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const mockResult = {
        user: { id: 1, email: 'test@example.com' },
        token: 'jwt_token_here'
      };
      
      authService.login.mockResolvedValue(mockResult);
      
      // Act
      await authController.login(req, res);
      
      // Assert
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: mockResult
      });
    });
    
    test('should return 400 for validation errors', async () => {
      // Arrange
      const mockErrors = [
        { field: 'email', message: 'Invalid email' }
      ];
      
      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockErrors)
      });
      
      // Act
      await authController.login(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation error',
        errors: mockErrors
      });
    });
    
    test('should return 401 for authentication errors', async () => {
      // Arrange
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      authService.login.mockRejectedValue(new Error('Invalid credentials'));
      
      // Act
      await authController.login(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });
  });
});