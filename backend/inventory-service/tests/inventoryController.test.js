const InventoryController = require('../src/controllers/inventoryController');
const InventoryModel = require('../src/models/inventoryModel');
const ProductModel = require('../src/models/productModel');
const VariantModel = require('../src/models/variantModel');

// Mock the models
jest.mock('../src/models/inventoryModel');
jest.mock('../src/models/productModel');
jest.mock('../src/models/variantModel');

describe('InventoryController', () => {
  let req, res, controller;
  let mockInventoryModel, mockProductModel, mockVariantModel;
  
  beforeEach(() => {
    // Mock model instances
    mockInventoryModel = {
      getLowStockItems: jest.fn(),
      callFunction: jest.fn(),
      callScalarFunction: jest.fn(),
      getInventoryLevels: jest.fn(),
      updateStock: jest.fn(),
      getStockHistory: jest.fn()
    };
    
    mockProductModel = {
      findAll: jest.fn(),
      findById: jest.fn()
    };
    
    mockVariantModel = {
      findAll: jest.fn(),
      findById: jest.fn()
    };
    
    InventoryModel.mockImplementation(() => mockInventoryModel);
    ProductModel.mockImplementation(() => mockProductModel);
    VariantModel.mockImplementation(() => mockVariantModel);
    
    // Mock request and response objects
    req = {
      query: {},
      params: {},
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    
    controller = new InventoryController();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getInventoryLevels', () => {
    test('should get all inventory levels with default pagination', async () => {
      // Arrange
      const mockInventoryData = [
        { product_id: 1, current_stock: 50, min_stock: 10, max_stock: 100 },
        { product_id: 2, current_stock: 25, min_stock: 5, max_stock: 50 }
      ];
      
      mockInventoryModel.callFunction.mockResolvedValue(mockInventoryData);
      mockInventoryModel.callScalarFunction.mockResolvedValue(2);
      
      // Act
      await controller.getInventoryLevels(req, res);
      
      // Assert
      expect(mockInventoryModel.callFunction).toHaveBeenCalledWith('fn_get_all_inventory', [10, 0]);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockInventoryData,
        totalCount: 2,
        pagination: {
          page: 1,
          limit: 10,
          totalPages: 1
        }
      });
    });
    
    test('should get low stock items when lowStock filter is true', async () => {
      // Arrange
      req.query = { lowStock: 'true', page: '1', limit: '5' };
      const mockLowStockItems = [
        { product_id: 1, current_stock: 5, min_stock: 10, max_stock: 100 }
      ];
      
      mockInventoryModel.getLowStockItems.mockResolvedValue(mockLowStockItems);
      
      // Act
      await controller.getInventoryLevels(req, res);
      
      // Assert
      expect(mockInventoryModel.getLowStockItems).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockLowStockItems,
        totalCount: 1,
        pagination: {
          page: 1,
          limit: 5,
          totalPages: 1
        }
      });
    });
    
    test('should handle errors gracefully', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      mockInventoryModel.callFunction.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await controller.getInventoryLevels(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
    });
  });
  
  describe('updateStock', () => {
    test('should update stock successfully', async () => {
      // Arrange
      req.body = {
        product_id: 1,
        quantity_change: 10,
        operation: 'add',
        reason: 'Stock replenishment'
      };
      
      const mockResult = {
        success: true,
        new_stock_level: 60
      };
      
      mockInventoryModel.updateStock.mockResolvedValue(mockResult);
      
      // Act
      await controller.updateStock(req, res);
      
      // Assert
      expect(mockInventoryModel.updateStock).toHaveBeenCalledWith({
        product_id: 1,
        quantity_change: 10,
        operation: 'add',
        reason: 'Stock replenishment'
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Stock updated successfully',
        data: mockResult
      });
    });
    
    test('should return 400 for invalid input', async () => {
      // Arrange
      req.body = { product_id: 1 }; // Missing required fields
      
      // Act
      await controller.updateStock(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Missing required fields'
      });
    });
  });
  
  describe('getStockHistory', () => {
    test('should return stock history for a product', async () => {
      // Arrange
      req.params = { productId: '1' };
      req.query = { limit: '10', offset: '0' };
      
      const mockHistory = [
        { id: 1, product_id: 1, change: 10, reason: 'Restock', timestamp: '2024-01-01' },
        { id: 2, product_id: 1, change: -5, reason: 'Sale', timestamp: '2024-01-02' }
      ];
      
      mockInventoryModel.getStockHistory.mockResolvedValue(mockHistory);
      
      // Act
      await controller.getStockHistory(req, res);
      
      // Assert
      expect(mockInventoryModel.getStockHistory).toHaveBeenCalledWith('1', 10, 0);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockHistory
      });
    });
  });
});