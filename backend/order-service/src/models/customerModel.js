const BaseModel = require('./baseModel');

class Customer extends BaseModel {
  constructor() {
    super('customer');
  }

  async findAll() {
    try {
      return await this.callFunction('fn_get_customers');
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const result = await this.callFunction('fn_get_customer_by_id', [id]);
      return result[0] || null;
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const result = await this.callFunction('fn_get_customer_by_email', [email]);
      return result[0] || null;
    } catch (error) {
      throw error;
    }
  }

  async create(customerData) {
    try {
      const result = await this.callProcedure('sp_create_customer', [
        null,
        null,
        null,
        customerData.name,
        customerData.phone || null,
        customerData.email || null,
        customerData.address || null
      ]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async update(id, updateData) {
  try {
    const result = await this.callProcedure('sp_update_customer', [
      null,
      null,
      id,
      updateData.name || null,
      updateData.contact_no || null,
      updateData.email || null,
      updateData.address || null
    ]);
    return result[0];
  } catch (error) {
    throw error;
  }
}


  async softDelete(id) {
    try {
      await this.callProcedure('sp_soft_delete_customer', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async getCustomerOrderHistory(customerId, limit = 10, offset = 0) {
    try {
      return await this.callFunction('fn_get_customer_order_history', [
        customerId,
        limit,
        offset
      ]);
    } catch (error) {
      throw error;
    }
  }

  async getCustomerStatistics(customerId) {
    try {
      const result = await this.callFunction('fn_get_customer_statistics', [customerId]);
      return result[0] || null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Customer;
