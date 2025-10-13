const CustomerController = require('../src/controllers/customerController');
const CustomerModel = require('../src/models/customerModel');

// Mock the customer model
jest.mock('../src/models/customerModel');

describe('CustomerController', () => {
  let customerController;
  let req, res;
  let mockCustomerModel;
  
  beforeEach(() => {
    customerController = new CustomerController();
    
    mockCustomerModel = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByEmail: jest.fn(),
      getCustomerOrders: jest.fn()
    };
    
    CustomerModel.mockImplementation(() => mockCustomerModel);
    
    req = {
      body: {},
      params: {},
      query: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getAllCustomers', () => {
    test('should return all customers with default pagination', async () => {
      // Arrange
      const mockCustomers = [
        { 
          id: 1, 
          name: 'John Doe', 
          email: 'john@example.com', 
          customer_type: 'retail',
          phone: '+1234567890'
        },
        { 
          id: 2, 
          name: 'Jane Smith', 
          email: 'jane@example.com', 
          customer_type: 'wholesale',
          phone: '+0987654321'
        }
      ];
      
      mockCustomerModel.findAll.mockResolvedValue(mockCustomers);
      
      // Act
      await customerController.getAllCustomers(req, res);
      
      // Assert
      expect(mockCustomerModel.findAll).toHaveBeenCalledWith(10, 0, {});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Customers retrieved successfully',
        data: {
          customers: mockCustomers,
          pagination: {
            page: 1,
            limit: 10
          }
        }
      });
    });
    
    test('should return customers with custom pagination and filters', async () => {
      // Arrange
      req.query = {
        page: '2',
        limit: '5',
        search: 'john',
        customer_type: 'retail'
      };
      
      const mockCustomers = [
        { 
          id: 1, 
          name: 'John Doe', 
          email: 'john@example.com', 
          customer_type: 'retail'
        }
      ];
      
      mockCustomerModel.findAll.mockResolvedValue(mockCustomers);
      
      // Act
      await customerController.getAllCustomers(req, res);
      
      // Assert
      expect(mockCustomerModel.findAll).toHaveBeenCalledWith(5, 5, {
        customer_type: 'retail',
        search: 'john'
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Customers retrieved successfully',
        data: {
          customers: mockCustomers,
          pagination: {
            page: 2,
            limit: 5
          }
        }
      });
    });
    
    test('should handle database errors', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      mockCustomerModel.findAll.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await customerController.getAllCustomers(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
    });
  });
  
  describe('getCustomerById', () => {
    test('should return customer by id', async () => {
      // Arrange
      req.params = { id: '1' };
      const mockCustomer = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        customer_type: 'retail'
      };
      
      mockCustomerModel.findById.mockResolvedValue(mockCustomer);
      
      // Act
      await customerController.getCustomerById(req, res);
      
      // Assert
      expect(mockCustomerModel.findById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Customer retrieved successfully',
        data: { customer: mockCustomer }
      });
    });
    
    test('should return 404 when customer not found', async () => {
      // Arrange
      req.params = { id: '999' };
      mockCustomerModel.findById.mockResolvedValue(null);
      
      // Act
      await customerController.getCustomerById(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Customer not found'
      });
    });
  });
  
  describe('createCustomer', () => {
    test('should create new customer successfully', async () => {
      // Arrange
      req.body = {
        name: 'New Customer',
        email: 'new@example.com',
        phone: '+1234567890',
        customer_type: 'retail',
        address: '123 Main St'
      };
      
      const mockCreatedCustomer = {
        id: 3,
        ...req.body,
        created_at: new Date()
      };
      
      mockCustomerModel.create.mockResolvedValue(mockCreatedCustomer);
      
      // Act
      await customerController.createCustomer(req, res);
      
      // Assert
      expect(mockCustomerModel.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Customer created successfully',
        data: { customer: mockCreatedCustomer }
      });
    });
    
    test('should handle validation errors', async () => {
      // Arrange
      req.body = { name: 'Invalid Customer' }; // Missing required fields
      
      const validationError = new Error('Email is required');
      mockCustomerModel.create.mockRejectedValue(validationError);
      
      // Act
      await customerController.createCustomer(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email is required'
      });
    });
  });
  
  describe('updateCustomer', () => {
    test('should update customer successfully', async () => {
      // Arrange
      req.params = { id: '1' };
      req.body = {
        name: 'Updated Name',
        phone: '+0987654321'
      };
      
      const mockUpdatedCustomer = {
        id: 1,
        name: 'Updated Name',
        email: 'john@example.com',
        phone: '+0987654321',
        customer_type: 'retail'
      };
      
      mockCustomerModel.update.mockResolvedValue(mockUpdatedCustomer);
      
      // Act
      await customerController.updateCustomer(req, res);
      
      // Assert
      expect(mockCustomerModel.update).toHaveBeenCalledWith('1', req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Customer updated successfully',
        data: { customer: mockUpdatedCustomer }
      });
    });
  });
  
  describe('deleteCustomer', () => {
    test('should delete customer successfully', async () => {
      // Arrange
      req.params = { id: '1' };
      mockCustomerModel.delete.mockResolvedValue(true);
      
      // Act
      await customerController.deleteCustomer(req, res);
      
      // Assert
      expect(mockCustomerModel.delete).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Customer deleted successfully'
      });
    });
    
    test('should handle deletion of non-existent customer', async () => {
      // Arrange
      req.params = { id: '999' };
      mockCustomerModel.delete.mockResolvedValue(false);
      
      // Act
      await customerController.deleteCustomer(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Customer not found'
      });
    });
  });
});