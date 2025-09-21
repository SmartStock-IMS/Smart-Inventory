const BaseModel = require('./baseModel');

class OrderItem extends BaseModel {
  constructor() {
    super('order_items');
  }

  async findByOrderId(orderId) {
    try {
      return await this.callFunction('fn_get_order_items_by_order', [orderId]);
    } catch (error) {
      throw error;
    }
  }

  async create(orderItemData) {
    try {
      const result = await this.callProcedure('sp_create_order_item', [
        orderItemData.order_id,
        orderItemData.product_id,
        orderItemData.variant_id || null,
        orderItemData.quantity,
        orderItemData.unit_price,
        orderItemData.total_price || (orderItemData.quantity * orderItemData.unit_price),
        orderItemData.discount_amount || 0,
        orderItemData.notes || null
      ]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async createBulk(orderItems) {
    try {
      const results = [];
      for (const item of orderItems) {
        const result = await this.create(item);
        results.push(result);
      }
      return results;
    } catch (error) {
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const result = await this.callProcedure('sp_update_order_item', [
        id,
        updateData.quantity || null,
        updateData.unit_price || null,
        updateData.total_price || null,
        updateData.discount_amount || null,
        updateData.notes || null
      ]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.callProcedure('sp_delete_order_item', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async getItemsWithProductDetails(orderId) {
    try {
      return await this.callFunction('fn_get_order_items_with_products', [orderId]);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = OrderItem;
