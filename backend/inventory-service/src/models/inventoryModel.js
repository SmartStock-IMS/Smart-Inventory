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

}

module.exports = Inventory;
