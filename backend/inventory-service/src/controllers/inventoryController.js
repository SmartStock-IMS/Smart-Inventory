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

  async createVehicle(req, res) {
    try {
      const {
        plate_number,
        type,
        name,
        status = 'available',
        next_service_day,
        last_service_day,
        notes
      } = req.body;

      // Validate required fields
      if (!plate_number || !type) {
        return res.status(400).json({
          success: false,
          message: 'Plate number and vehicle type are required'
        });
      }

      // Validate vehicle type
      const validTypes = ['three-wheeler', 'motorcycle', 'van', 'truck', 'car', 'other'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid vehicle type. Must be one of: ${validTypes.join(', ')}`
        });
      }

      // Validate status
      const validStatuses = ['available', 'inuse', 'maintenance'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      // Call the stored procedure via the model
      const result = await Inventory.createVehicle({
        plate_number,
        type,
        name,
        status,
        next_service_day,
        last_service_day,
        notes
      });

      if (!result.p_success) {
        return res.status(400).json({
          success: false,
          message: result.p_message || 'Vehicle creation failed'
        });
      }

      res.status(201).json({
        success: true,
        message: result.p_message || 'Vehicle created successfully',
        data: {
          vehicle_id: result.p_vehicle_id,
          plate_number,
          type,
          name,
          status
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllVehicles(req, res) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = parseInt(req.query.offset, 10) || 0;

      const vehicles = await Inventory.getAllVehicles(limit, offset);

      res.status(200).json({
        success: true,
        message: 'Vehicles retrieved successfully',
        data: { vehicles }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getVehicleById(req, res) {
    try {
      const { id } = req.params;
      const vehicle = await Inventory.getVehicleById(id);

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Vehicle retrieved successfully',
        data: { vehicle }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createStockMovement(req, res) {
    try {
      const {
        resource_manager_id,
        driver_name,
        vehicle_id,
        driver_phone_no,
        movement_date,
        status = 'inprogress',
        notes
      } = req.body;

      // Validate required fields
      if (!resource_manager_id || !driver_name) {
        return res.status(400).json({
          success: false,
          message: 'Resource manager ID and driver name are required'
        });
      }

      // Validate status
      const validStatuses = ['inprogress', 'completed'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      // Call the stored procedure via the model
      const result = await Inventory.createStockMovement({
        resource_manager_id,
        driver_name,
        vehicle_id,
        driver_phone_no,
        movement_date,
        status,
        notes
      });

      if (!result.p_success) {
        return res.status(400).json({
          success: false,
          message: result.p_message || 'Stock movement creation failed'
        });
      }

      res.status(201).json({
        success: true,
        message: result.p_message || 'Stock movement created successfully',
        data: {
          movement_id: result.p_movement_id,
          resource_manager_id,
          driver_name,
          vehicle_id,
          status
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getInProgressStockMovements(req, res) {
    try {
      const { resource_manager_id } = req.params;
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = parseInt(req.query.offset, 10) || 0;

      // Validate resource manager ID
      if (!resource_manager_id) {
        return res.status(400).json({
          success: false,
          message: 'Resource manager ID is required'
        });
      }

      const movements = await Inventory.getInProgressStockMovementsByRM(
        resource_manager_id,
        limit,
        offset
      );

      res.status(200).json({
        success: true,
        message: 'In-progress stock movements retrieved successfully',
        data: {
          movements,
          pagination: {
            limit,
            offset,
            count: movements.length
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

  async completeStockMovement(req, res) {
    try {
      const { movement_id } = req.params;
      const { completion_notes } = req.body;

      if (!movement_id) {
        return res.status(400).json({
          success: false,
          message: 'Movement ID is required'
        });
      }

      const result = await Inventory.completeStockMovement(
        movement_id,
        completion_notes
      );

      if (!result.p_success) {
        return res.status(400).json({
          success: false,
          message: result.p_message || 'Failed to complete stock movement'
        });
      }

      res.status(200).json({
        success: true,
        message: result.p_message || 'Stock movement completed successfully',
        data: { movement_id }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateVehicle(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validate at least one field to update
      if (
        !updateData.plate_number &&
        !updateData.type &&
        !updateData.name &&
        !updateData.status &&
        !updateData.next_service_day &&
        !updateData.last_service_day &&
        !updateData.notes
      ) {
        return res.status(400).json({
          success: false,
          message: 'No fields provided to update'
        });
      }

      const result = await Inventory.updateVehicle(id, updateData);

      if (!result.p_success) {
        return res.status(400).json({
          success: false,
          message: result.p_message || 'Vehicle update failed'
        });
      }

      // Optionally, fetch updated vehicle
      const vehicle = await Inventory.getVehicleById(id);

      res.status(200).json({
        success: true,
        message: result.p_message || 'Vehicle updated successfully',
        data: { vehicle }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteVehicle(req, res) {
    try {
      const { id } = req.params;

      const result = await Inventory.deleteVehicle(id);

      if (!result.p_success) {
        return res.status(400).json({
          success: false,
          message: result.p_message || 'Vehicle deletion failed'
        });
      }

      res.status(200).json({
        success: true,
        message: result.p_message || 'Vehicle deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new InventoryController();
