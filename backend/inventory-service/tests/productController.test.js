const ProductController = require('../src/controllers/productController');
const ProductModel = require('../src/models/productModel');
const VariantModel = require('../src/models/variantModel');
const InventoryModel = require('../src/models/inventoryModel');
const cloudinary = require('../src/config/cloudinary');

// Mock the models and cloudinary
jest.mock('../src/models/productModel');
jest.mock('../src/models/variantModel');
jest.mock('../src/models/inventoryModel');
jest.mock('../src/config/cloudinary');

describe('ProductController', () => {
  let productController;
  let req, res;
  let mockProductModel, mockVariantModel, mockInventoryModel;
  
  beforeEach(() => {
    productController = new ProductController();
    
    // Mock model instances
    mockProductModel = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getCategories: jest.fn()
    };
    
    mockVariantModel = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };
    
    mockInventoryModel = {
      findAll: jest.fn(),
      updateStock: jest.fn()
    };
    
    ProductModel.mockImplementation(() => mockProductModel);
    VariantModel.mockImplementation(() => mockVariantModel);
    InventoryModel.mockImplementation(() => mockInventoryModel);
    
    req = {
      body: {},
      params: {},
      query: {},
      file: null
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    // Mock cloudinary
    cloudinary.uploader = {
      upload_stream: jest.fn()
    };
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('uploadProductImage', () => {
    test('should upload image successfully', async () => {
      // Arrange
      req.file = {
        buffer: Buffer.from('fake image data'),
        mimetype: 'image/jpeg'
      };
      
      const mockCloudinaryResult = {
        secure_url: 'https://cloudinary.com/image/upload/v123/image.jpg',
        public_id: 'smartstock/products/image_id'
      };
      
      cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        callback(null, mockCloudinaryResult);
        return { end: jest.fn() };
      });
      
      // Act
      await productController.uploadProductImage(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          imageUrl: mockCloudinaryResult.secure_url,
          publicId: mockCloudinaryResult.public_id
        }
      });
    });
    
    test('should return 400 if no file provided', async () => {
      // Arrange
      req.file = null;
      
      // Act
      await productController.uploadProductImage(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No image file provided'
      });
    });
    
    test('should handle cloudinary upload errors', async () => {
      // Arrange
      req.file = {
        buffer: Buffer.from('fake image data'),
        mimetype: 'image/jpeg'
      };
      
      cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        callback(new Error('Cloudinary upload failed'));
        return { end: jest.fn() };
      });
      
      // Act
      await productController.uploadProductImage(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to upload image'
      });
    });
  });
  
  describe('Product CRUD Operations', () => {
    test('should get all products with pagination', async () => {
      // Arrange
      req.query = { page: '1', limit: '10' };
      const mockProducts = [
        { id: 1, name: 'Product 1', category: 'Electronics' },
        { id: 2, name: 'Product 2', category: 'Clothing' }
      ];
      
      mockProductModel.findAll.mockResolvedValue(mockProducts);
      
      // Act
      await productController.getAllProducts(req, res);
      
      // Assert
      expect(mockProductModel.findAll).toHaveBeenCalledWith(10, 0, {});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Products retrieved successfully',
        data: expect.objectContaining({
          products: mockProducts
        })
      });
    });
    
    test('should handle database errors gracefully', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      mockProductModel.findAll.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await productController.getAllProducts(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
    });
  });
});