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
      const { page = 1, limit = 100, category, status, search } = req.query;
      const offset = (page - 1) * limit;

      // Use the model's findAll method directly since it doesn't support filters yet
      const products = await Product.findAll(parseInt(limit), parseInt(offset));

      res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        data: {
          products: products || [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            count: products ? products.length : 0
          }
        }
      });
    } catch (error) {
      console.error('getAllProducts error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch products'
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
      
      // Try direct SQL query first since function might not exist
      let categories;
      try {
        // Use direct SQL query for reliability
        categories = await Variant.query(
          'SELECT category_id, category_name, description, pic_url FROM product_category ORDER BY category_name'
        );
        console.log('Categories from direct query:', categories);
      } catch (directQueryError) {
        console.log('Direct query failed, trying function:', directQueryError.message);
        
        // Fallback to stored function
        try {
          categories = await Variant.findAll();
          console.log('Categories from function:', categories);
        } catch (functionError) {
          console.log('Function also failed:', functionError.message);
          categories = [];
        }
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
        message: error.message || 'Failed to fetch categories'
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

  // Variant methods
  async getAllVariants(req, res) {
    try {
      const limit = Number(req.query.limit ?? 1000);
      const offset = Number(req.query.offset ?? 0);

      const variants = await Variant.findAll();
      
      res.status(200).json({
        success: true,
        data: {
          variants,
          pagination: { limit, offset, count: variants.length }
        }
      });
    } catch (error) {
      console.error('getAllVariants error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch variants'
      });
    }
  }

  async getVariantsByProduct(req, res) {
    try {
      const { productId } = req.params;
      
      const variants = await Variant.findByProductId(productId);
      
      res.status(200).json({
        success: true,
        data: { variants }
      });
    } catch (error) {
      console.error('getVariantsByProduct error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product variants'
      });
    }
  }

}

module.exports = new ProductController();
