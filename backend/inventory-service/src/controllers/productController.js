const ProductModel = require('../models/productModel');
const VariantModel = require('../models/variantModel');
const InventoryModel = require('../models/inventoryModel');

const Product = new ProductModel();
const Variant = new VariantModel();
const Inventory = new InventoryModel();

class ProductController {

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
      const { page = 1, limit = 10, category, status, search } = req.query;
      const offset = (page - 1) * limit;

      const filters = {};
      if (category) filters.category = category;
      if (status) filters.status = status;
      if (search) filters.search = search;

      const categories = await Variant.findAll(parseInt(limit), parseInt(offset), filters);

      res.status(200).json({
        success: true,
        message: 'Categories retrieved successfully',
        data: {
          categories: categories,
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

}

module.exports = new ProductController();
