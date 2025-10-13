const OrderController = require('../src/controllers/orderController');
const OrderModel = require('../src/models/orderModel');
const CustomerModel = require('../src/models/customerModel');
const OrderItemModel = require('../src/models/orderItemModel');

// Mock the models
jest.mock('../src/models/orderModel');
jest.mock('../src/models/customerModel');
jest.mock('../src/models/orderItemModel');

describe('OrderController', () => {
  let orderController;
  let req, res;
  let mockOrderModel, mockCustomerModel, mockOrderItemModel;
  
  beforeEach(() => {
    orderController = new OrderController();
    
    // Mock model instances
    mockOrderModel = {
      getAllOrdersData: jest.fn(),
      getOrderById: jest.fn(),
      createOrder: jest.fn(),
      updateOrder: jest.fn(),
      deleteOrder: jest.fn(),
      getOrdersByStatus: jest.fn(),
      getOrdersByDateRange: jest.fn(),
      calculateOrderTotal: jest.fn()
    };
    
    mockCustomerModel = {
      findById: jest.fn(),
      findAll: jest.fn()
    };
    
    mockOrderItemModel = {
      getOrderItems: jest.fn(),
      createOrderItem: jest.fn(),
      updateOrderItem: jest.fn(),
      deleteOrderItem: jest.fn()
    };
    
    OrderModel.mockImplementation(() => mockOrderModel);
    CustomerModel.mockImplementation(() => mockCustomerModel);
    OrderItemModel.mockImplementation(() => mockOrderItemModel);
    
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
  
  describe('getAllOrdersData', () => {
    test('should return all orders with default pagination', async () => {
      // Arrange
      const mockOrders = [
        { 
          id: 1, 
          customer_id: 1, 
          status: 'pending', 
          total: 100.00,
          order_date: '2024-01-01',
          items: []
        },
        { 
          id: 2, 
          customer_id: 2, 
          status: 'completed', 
          total: 150.00,
          order_date: '2024-01-02',
          items: []
        }
      ];
      
      mockOrderModel.getAllOrdersData.mockResolvedValue(mockOrders);
      
      // Act
      await orderController.getAllOrdersData(req, res);
      
      // Assert
      expect(mockOrderModel.getAllOrdersData).toHaveBeenCalledWith(10, 0, {
        status: null,
        start_date: null,
        end_date: null
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrders
      });
    });
    
    test('should return orders with custom filters', async () => {
      // Arrange
      req.query = {
        limit: '20',
        offset: '5',
        status: 'completed',
        start_date: '2024-01-01',
        end_date: '2024-01-31'
      };
      
      const mockOrders = [
        { 
          id: 1, 
          status: 'completed', 
          total: 100.00,
          order_date: '2024-01-15'
        }
      ];
      
      mockOrderModel.getAllOrdersData.mockResolvedValue(mockOrders);
      
      // Act
      await orderController.getAllOrdersData(req, res);
      
      // Assert
      expect(mockOrderModel.getAllOrdersData).toHaveBeenCalledWith(20, 5, {
        status: 'completed',
        start_date: '2024-01-01',
        end_date: '2024-01-31'
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrders
      });
    });
    
    test('should handle errors properly', async () => {
      // Arrange
      const errorMessage = 'Database connection error';
      mockOrderModel.getAllOrdersData.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await orderController.getAllOrdersData(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
    });
  });
  
  describe('getOrderById', () => {
    test('should return order by id with items', async () => {
      // Arrange
      req.params = { id: '1' };
      const mockOrder = {
        id: 1,
        customer_id: 1,
        status: 'pending',
        total: 100.00,
        order_date: '2024-01-01'
      };
      
      const mockOrderItems = [
        { id: 1, product_id: 1, quantity: 2, unit_price: 25.00 },
        { id: 2, product_id: 2, quantity: 1, unit_price: 50.00 }
      ];
      
      mockOrderModel.getOrderById.mockResolvedValue(mockOrder);
      mockOrderItemModel.getOrderItems.mockResolvedValue(mockOrderItems);
      
      // Act
      await orderController.getOrderById(req, res);
      
      // Assert
      expect(mockOrderModel.getOrderById).toHaveBeenCalledWith('1');
      expect(mockOrderItemModel.getOrderItems).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          ...mockOrder,
          items: mockOrderItems
        }
      });
    });
    
    test('should return 404 when order not found', async () => {
      // Arrange
      req.params = { id: '999' };
      mockOrderModel.getOrderById.mockResolvedValue(null);
      
      // Act
      await orderController.getOrderById(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Order not found'
      });
    });
  });
  
  describe('createOrder', () => {
    test('should create new order successfully', async () => {
      // Arrange
      req.body = {
        customer_id: 1,
        items: [
          { product_id: 1, quantity: 2, unit_price: 25.00 },
          { product_id: 2, quantity: 1, unit_price: 50.00 }
        ],
        status: 'pending'
      };
      
      const mockCustomer = { id: 1, name: 'John Doe' };
      const mockCreatedOrder = {
        id: 3,
        customer_id: 1,
        status: 'pending',
        total: 100.00,
        order_date: new Date()
      };
      
      mockCustomerModel.findById.mockResolvedValue(mockCustomer);
      mockOrderModel.createOrder.mockResolvedValue(mockCreatedOrder);
      mockOrderItemModel.createOrderItem.mockResolvedValue(true);
      
      // Act
      await orderController.createOrder(req, res);
      
      // Assert
      expect(mockCustomerModel.findById).toHaveBeenCalledWith(1);
      expect(mockOrderModel.createOrder).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Order created successfully',
        data: { order: mockCreatedOrder }
      });
    });
    
    test('should return 404 when customer not found', async () => {
      // Arrange
      req.body = { customer_id: 999, items: [] };
      mockCustomerModel.findById.mockResolvedValue(null);
      
      // Act
      await orderController.createOrder(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Customer not found'
      });
    });
    
    test('should return 400 for empty order items', async () => {
      // Arrange
      req.body = { customer_id: 1, items: [] };
      const mockCustomer = { id: 1, name: 'John Doe' };
      mockCustomerModel.findById.mockResolvedValue(mockCustomer);
      
      // Act
      await orderController.createOrder(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Order must contain at least one item'
      });
    });
  });
  
  describe('updateOrderStatus', () => {
    test('should update order status successfully', async () => {
      // Arrange
      req.params = { id: '1' };
      req.body = { status: 'completed' };
      
      const mockOrder = { id: 1, status: 'pending' };
      const mockUpdatedOrder = { id: 1, status: 'completed' };
      
      mockOrderModel.getOrderById.mockResolvedValue(mockOrder);
      mockOrderModel.updateOrder.mockResolvedValue(mockUpdatedOrder);
      
      // Act
      await orderController.updateOrderStatus(req, res);
      
      // Assert
      expect(mockOrderModel.updateOrder).toHaveBeenCalledWith('1', { status: 'completed' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Order status updated successfully',
        data: { order: mockUpdatedOrder }
      });
    });
    
    test('should return 400 for invalid status', async () => {
      // Arrange
      req.params = { id: '1' };
      req.body = { status: 'invalid_status' };
      
      // Act
      await orderController.updateOrderStatus(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid order status'
      });
    });
  });
  
  describe('deleteOrder', () => {
    test('should delete order successfully', async () => {
      // Arrange
      req.params = { id: '1' };
      const mockOrder = { id: 1, status: 'pending' };
      
      mockOrderModel.getOrderById.mockResolvedValue(mockOrder);
      mockOrderModel.deleteOrder.mockResolvedValue(true);
      
      // Act
      await orderController.deleteOrder(req, res);
      
      // Assert
      expect(mockOrderModel.deleteOrder).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Order deleted successfully'
      });
    });
    
    test('should return 400 when trying to delete completed order', async () => {
      // Arrange
      req.params = { id: '1' };
      const mockOrder = { id: 1, status: 'completed' };
      
      mockOrderModel.getOrderById.mockResolvedValue(mockOrder);
      
      // Act
      await orderController.deleteOrder(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Cannot delete completed orders'
      });
    });
  });
});