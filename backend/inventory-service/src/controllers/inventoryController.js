const InventoryModel = require('../models/inventoryModel');
const ProductModel = require('../models/productModel');
const VariantModel = require('../models/variantModel');

// Create instances
const Inventory = new InventoryModel();
const Product = new ProductModel();
const Variant = new VariantModel();

class InventoryController {
  /*
  async getInventoryLevels(req, res) {
    try {
      const { page = 1, limit = 10, lowStock = false } = req.query;
      const offset = (page - 1) * limit;

      let inventoryData;
      let totalCount;

      if (lowStock === 'true') {
        inventoryData = await Inventory.getLowStockItems();
        totalCount = inventoryData.length;
        // Apply pagination manually for low stock items
        inventoryData = inventoryData.slice(offset, offset + parseInt(limit));
      } else {
        inventoryData = await Inventory.callFunction('fn_get_all_inventory', [
          parseInt(limit),
          parseInt(offset)
        ]);
        totalCount = await Inventory.callScalarFunction('fn_count_inventory', []);
      }

      res.status(200).json({
        success: true,
        message: 'Inventory levels retrieved successfully',
        data: {
          inventory: inventoryData,
          pagination: {
            total: totalCount || 0,
            page: parseInt(page),
            pages: Math.ceil((totalCount || 0) / parseInt(limit)),
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

  async updateInventory(req, res) {
    try {
      const { id } = req.params;
      const { quantity, type = 'set', reason } = req.body;

      const inventoryItem = await Inventory.callFunction('fn_get_inventory_by_id', [id]);
      if (!inventoryItem || inventoryItem.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Inventory item not found'
        });
      }

      const currentItem = inventoryItem[0];
      let operation = type;
      
      // Convert 'set' type to appropriate operation
      if (type === 'set') {
        operation = quantity > currentItem.quantity ? 'add' : 'subtract';
        const diff = Math.abs(quantity - currentItem.quantity);
        await Inventory.updateStock(id, diff, operation);
      } else {
        await Inventory.updateStock(id, quantity, operation);
      }

      // Get updated inventory item
      const updatedInventory = await Inventory.callFunction('fn_get_inventory_by_id', [id]);

      res.status(200).json({
        success: true,
        message: 'Inventory updated successfully',
        data: { inventory: updatedInventory[0] }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async reserveInventory(req, res) {
    try {
      const { product_id, variant_id, quantity } = req.body;

      const result = await Inventory.reserveStock(product_id, variant_id, quantity);
      
      if (!result) {
        return res.status(400).json({
          success: false,
          message: 'Unable to reserve inventory - insufficient stock or item not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Inventory reserved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async releaseReservation(req, res) {
    try {
      const { product_id, variant_id, quantity } = req.body;

      const result = await Inventory.releaseReservedStock(product_id, variant_id, quantity);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Inventory item not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Reservation released successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
    */
}

module.exports = new InventoryController();
