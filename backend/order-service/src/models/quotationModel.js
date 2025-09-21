const BaseModel = require('./baseModel');

class Quotation extends BaseModel {
  constructor() {
    super('quotations');
  }

  async findAll(limit = 10, offset = 0, filters = {}) {
    try {
      return await this.callFunction('fn_get_quotations', [
        limit,
        offset,
        filters.status || null,
        filters.customer_id || null,
        filters.date_from || null,
        filters.date_to || null
      ]);
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const result = await this.callFunction('fn_get_quotation_by_id', [id]);
      return result[0] || null;
    } catch (error) {
      throw error;
    }
  }

  async create(quotationData) {
    try {
      const result = await this.callProcedure('sp_create_quotation', [
        quotationData.customer_id,
        quotationData.quotation_date || new Date(),
        quotationData.valid_until || null,
        quotationData.status || 'draft',
        quotationData.total_amount || 0,
        quotationData.discount_amount || 0,
        quotationData.tax_amount || 0,
        quotationData.notes || null,
        quotationData.sales_rep_id || null
      ]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const result = await this.callProcedure('sp_update_quotation', [
        id,
        updateData.valid_until || null,
        updateData.status || null,
        updateData.total_amount || null,
        updateData.discount_amount || null,
        updateData.tax_amount || null,
        updateData.notes || null
      ]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async convertToOrder(quotationId) {
    try {
      const result = await this.callProcedure('sp_convert_quotation_to_order', [quotationId]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async updateStatus(id, status) {
    try {
      const result = await this.callProcedure('sp_update_quotation_status', [id, status]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async getQuotationsWithItems(limit = 10, offset = 0) {
    try {
      return await this.callFunction('fn_get_quotations_with_items', [limit, offset]);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Quotation;
