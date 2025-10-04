const BaseModel = require('./baseModel');

class Inventory extends BaseModel {
  constructor() {
    super('inventory');
  }
/*
  async findByProductId(productId) {
    try {
      const result = await this.callFunction('fn_get_inventory_by_product', [productId]);
      return result[0] || null;
    } catch (error) {
      throw error;
    }
  }

  async findByVariantId(variantId) {
    try {
      const result = await this.callFunction('fn_get_inventory_by_variant', [variantId]);
      return result[0] || null;
    } catch (error) {
      throw error;
    }
  }

  async create(inventoryData) {
    try {
      const result = await this.callProcedure('sp_create_inventory', [
        inventoryData.product_id,
        inventoryData.variant_id || null,
        inventoryData.quantity || 0,
        inventoryData.reserved_quantity || 0,
        inventoryData.min_stock_level || 10,
        inventoryData.max_stock_level || 1000,
        inventoryData.reorder_point || 20,
        inventoryData.location || null,
        inventoryData.batch_number || null,
        inventoryData.expiry_date || null
      ]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async updateStock(id, quantity, operation = 'add') {
    try {
      const result = await this.callProcedure('sp_update_inventory_stock', [
        id,
        quantity,
        operation
      ]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async reserveStock(productId, variantId, quantity) {
    try {
      const result = await this.callProcedure('sp_reserve_inventory_stock', [
        productId,
        variantId,
        quantity
      ]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async releaseReservedStock(productId, variantId, quantity) {
    try {
      const result = await this.callProcedure('sp_release_reserved_stock', [
        productId,
        variantId,
        quantity
      ]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async getLowStockItems() {
    try {
      return await this.callFunction('fn_get_low_stock_inventory', []);
    } catch (error) {
      throw error;
    }
  }

  async getStockHistory(productId, variantId = null, limit = 10) {
    try {
      return await this.callFunction('fn_get_stock_history', [
        productId,
        variantId,
        limit
      ]);
    } catch (error) {
      throw error;
    }
  }*/

  /**
   * Creates a new vehicle using sp_create_vehicle stored procedure
   * @param {Object} vehicleData - The vehicle data
   * @returns {Object} Procedure output: { p_vehicle_id, p_success, p_message }
   */
  async createVehicle(vehicleData) {
    try {
      const {
        plate_number,
        type,
        name = null,
        status = 'available',
        next_service_day = null,
        last_service_day = null,
        notes = null
      } = vehicleData;

      const result = await this.callProcedure('sp_create_vehicle', [
        null, // p_vehicle_id OUT parameter
        null, // p_success OUT parameter
        null, // p_message OUT parameter
        plate_number,
        type,
        name,
        status,
        next_service_day,
        last_service_day,
        notes
      ]);

      return result[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all vehicles
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<Array>}
   */
  async getAllVehicles(limit = 10, offset = 0) {
    try {
      return await this.callFunction('fn_get_vehicles', [limit, offset]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get vehicle by ID
   * @param {string} vehicleId
   * @returns {Promise<Object>}
   */
  async getVehicleById(vehicleId) {
    try {
      const result = await this.callFunction('fn_get_vehicle_by_id', [vehicleId]);
      return result[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Creates a new stock movement using sp_create_stock_movement stored procedure
   * @param {Object} movementData - The stock movement data
   * @returns {Object} Procedure output: { p_movement_id, p_success, p_message }
   */
  async createStockMovement(movementData) {
    try {
      const {
        resource_manager_id,
        driver_name,
        vehicle_id = null,
        driver_phone_no = null,
        movement_date = null,
        status = 'inprogress',
        notes = null
      } = movementData;

      const result = await this.callProcedure('sp_create_stock_movement', [
        null, // p_movement_id OUT parameter
        null, // p_success OUT parameter
        null, // p_message OUT parameter
        resource_manager_id,
        driver_name,
        vehicle_id,
        driver_phone_no,
        movement_date,
        status,
        notes
      ]);

      return result[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get in-progress stock movements for a specific resource manager
   * @param {string} resourceManagerId - The resource manager UUID
   * @param {number} limit - Maximum number of records to return
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} List of in-progress stock movements
   */
  async getInProgressStockMovementsByRM(resourceManagerId, limit = 10, offset = 0) {
    try {
      return await this.callFunction('fn_get_inprogress_stock_movements_by_rm', [
        resourceManagerId,
        limit,
        offset
      ]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Complete a stock movement using sp_complete_stock_movement stored procedure
   * @param {string} movementId - The movement UUID
   * @param {string} notes - Optional completion notes
   * @returns {Object} Procedure output: { p_success, p_message }
   */
  async completeStockMovement(movementId, notes = null) {
    try {
      const result = await this.callProcedure('sp_complete_stock_movement', [
        null, // p_success OUT parameter
        null, // p_message OUT parameter
        movementId,
        notes
      ]);

      return result[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a vehicle using sp_update_vehicle stored procedure
   * @param {string} vehicleId
   * @param {Object} updateData
   * @returns {Object} Procedure output: { p_success, p_message }
   */
  async updateVehicle(vehicleId, updateData) {
    try {
      const {
        plate_number = null,
        type = null,
        name = null,
        status = null,
        next_service_day = null,
        last_service_day = null,
        notes = null
      } = updateData;

      const result = await this.callProcedure('sp_update_vehicle', [
        null, // p_success OUT
        null, // p_message OUT
        vehicleId,
        plate_number,
        type,
        name,
        status,
        next_service_day,
        last_service_day,
        notes
      ]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a vehicle using sp_delete_vehicle stored procedure
   * @param {string} vehicleId
   * @returns {Object} Procedure output: { p_success, p_message }
   */
  async deleteVehicle(vehicleId) {
    try {
      const result = await this.callProcedure('sp_delete_vehicle', [
        null, // p_success OUT
        null, // p_message OUT
        vehicleId
      ]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Inventory;
