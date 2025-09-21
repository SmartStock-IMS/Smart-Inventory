const axios = require('axios');

class InventoryService {
  constructor() {
    this.baseURL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3002';
  }

  async reserveInventory(productId, variantId, quantity) {
    try {
      const response = await axios.post(`${this.baseURL}/inventory/reserve`, {
        product_id: productId,
        variant_id: variantId,
        quantity
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to reserve inventory: ${error.response?.data?.message || error.message}`);
    }
  }

  async releaseReservation(productId, variantId, quantity) {
    try {
      const response = await axios.post(`${this.baseURL}/inventory/release`, {
        product_id: productId,
        variant_id: variantId,
        quantity
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to release reservation: ${error.response?.data?.message || error.message}`);
    }
  }

  async updateInventory(inventoryId, quantity, type = 'subtract') {
    try {
      const response = await axios.put(`${this.baseURL}/inventory/${inventoryId}`, {
        quantity,
        type,
        reason: 'Order fulfillment'
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update inventory: ${error.response?.data?.message || error.message}`);
    }
  }

  async getProduct(productId) {
    try {
      const response = await axios.get(`${this.baseURL}/products/${productId}`);
      return response.data.data.product;
    } catch (error) {
      throw new Error(`Failed to get product: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = new InventoryService();
