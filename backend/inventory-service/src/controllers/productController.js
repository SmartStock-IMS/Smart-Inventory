const ProductModel = require('../models/productModel');
const VariantModel = require('../models/variantModel');
const InventoryModel = require('../models/inventoryModel');
const cloudinary = require('../config/cloudinary');

const Product = new ProductModel();
const Variant = new VariantModel();
const Inventory = new InventoryModel();

class ProductController {

  async uploadProductImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'smartstock/products',
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          imageUrl: result.secure_url,
          publicId: result.public_id
        }
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image'
      });
    }
  }

  async getMostPopularProducts(req, res) {
    try {
      const { limit = 10 } = req.query;
      const products = await Product.getMostPopularProducts(parseInt(limit));
      res.status(200).json({
        success: true,
        message: 'Most popular products retrieved successfully',
        data: { products }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllProducts(req, res) {
    try {
      const { page = 1, limit = 10, category, status, search } = req.query;
      const offset = (page - 1) * limit;

      const filters = {};
      if (category) filters.category = category;
      if (status) filters.status = status;
      if (search) filters.search = search;

      const products = await Product.findAll(parseInt(limit), parseInt(offset), filters);

      res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        data: {
          products: products,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }


      // Combine the data
      const productWithDetails = {
        ...product
      };

      res.status(200).json({
        success: true,
        message: 'Product retrieved successfully',
        data: { product: productWithDetails }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createProduct(req, res) {
    try {
      const productData = req.body;
      

      const product = await Product.create(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { product }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const updatedProduct = await Product.update(id, updates);

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: { product: updatedProduct }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      await Product.delete(id);

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllCategories(req, res) {
    try {
      console.log('Getting categories...');
      
      // Try to get categories using the stored function first
      let categories;
      try {
        categories = await Variant.findAll();
        console.log('Categories from function:', categories);
      } catch (functionError) {
        console.log('Function failed, trying direct query:', functionError.message);
        
        // Fallback to direct SQL query
        categories = await Variant.query(
          'SELECT category_id, category_name, description, pic_url FROM product_category ORDER BY category_name'
        );
        console.log('Categories from direct query:', categories);
      }

      res.status(200).json({
        success: true,
        message: 'Categories retrieved successfully',
        data: {
          categories: categories || []
        }
      });
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createProductCategory(req, res) {
    try {
      const categoryData = req.body;

      const category = await Variant.create(categoryData);

      res.status(201).json({
        success: true,
        message: 'Product category created successfully',
        data: { category }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getProductByCategoryId(req, res) {
    try {
      const { id } = req.params;
      const product = await Variant.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }


      // Combine the data
      const productWithDetails = {
        ...product
      };

      res.status(200).json({
        success: true,
        message: 'Product retrieved successfully',
        data: { product: productWithDetails }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateProductCategory(req, res) {
    try {
      const { id } = req.params;
      const categoryData = req.body;

      const category = await Variant.updateCategory(id, categoryData);

      res.status(200).json({
        success: true,
        message: 'Product category updated successfully',
        data: { category }
      });
    } catch (error) {
      console.error('CONTROLLER UPDATE ERROR:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteProductCategory(req, res) {
    try {
      const { id } = req.params;

      const result = await Variant.deleteCategory(id);

      res.status(200).json({
        success: true,
        message: 'Product category deleted successfully',
        data: { result }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

}

module.exports = new ProductController();
