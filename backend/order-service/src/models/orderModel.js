const BaseModel = require('./baseModel');

class Order extends BaseModel {
  constructor() {
    super('customer_orders');
  }

  /**
   * Calls the sp_create_customer_order procedure to create an order with items.
   * @param {Object} params - The order parameters.
   * @param {string} params.customer_id
   * @param {string} params.sales_staff_id
   * @param {Array} params.items
   * @param {string} [params.order_type]
   * @param {string} [params.delivery_date]
   * @returns {Object} Procedure output: { p_order_id, p_success, p_message, p_order_total }
   */
  async createCustomerOrder({ customer_id, sales_staff_id, items, order_type = 'quotation', delivery_date = null }) {
    try {
      // Prepare the call to the stored procedure
      // The order items must be passed as JSONB
      const orderItemsJson = JSON.stringify(items);
      // The order_type and delivery_date are optional
      const result = await this.callProcedure('sp_create_customer_order', [
        null,
        null,
        null,
        null,
        customer_id,
        sales_staff_id,
        orderItemsJson,
        order_type,
        delivery_date
      ]);
      // The result is expected to be an array with one object containing the OUT params
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async findAll(limit = 10, offset = 0, filters = {}) {
    try {
      return await this.callFunction('fn_get_orders', [
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
  /**
   * Fetches comprehensive order data using fn_get_all_orders_data.
   * @param {number} limit
   * @param {number} offset
   * @param {object} filters - { status, start_date, end_date }
   * @returns {Promise<Array>}
   */
  async getAllOrdersData(limit = 10, offset = 0, filters = {}) {
    try {
      return await this.callFunction('fn_get_all_orders_data', [
        limit,
        offset,
        filters.status || null,
        filters.start_date || null,
        filters.end_date || null
      ]);
    } catch (error) {
      throw error;
    }
  }

  async findOrderdataBySalesRep(id) {
    try {
      const result = await this.callFunction('fn_get_orders_by_sales_rep', [id]);
      return result;
    } catch (error) {
      throw error;
    }
  }
  
    async findById(id) {
      try {
        const result = await this.callFunction('fn_get_order_by_id', [id]);
        return result[0] || null;
      } catch (error) {
        throw error;
      }
    }
  /*
    async findByCustomerId(customerId, limit = 10, offset = 0) {
      try {
        return await this.callFunction('fn_get_orders_by_customer', [
          customerId,
          limit,
          offset
        ]);
      } catch (error) {
        throw error;
      }
    }
  
    async create(orderData) {
      try {
        const result = await this.callProcedure('sp_create_order', [
          orderData.customer_id,
          orderData.order_date || new Date(),
          orderData.status || 'pending',
          orderData.total_amount || 0,
          orderData.discount_amount || 0,
          orderData.tax_amount || 0,
          orderData.shipping_address || null,
          orderData.billing_address || null,
          orderData.notes || null,
          orderData.sales_rep_id || null
        ]);
        return result[0];
      } catch (error) {
        throw error;
      }
    }
  /*
    async update(id, updateData) {
      try {
        const result = await this.callProcedure('sp_update_order', [
          id,
          updateData.status || null,
          updateData.total_amount || null,
          updateData.discount_amount || null,
          updateData.tax_amount || null,
          updateData.shipping_address || null,
          updateData.billing_address || null,
          updateData.notes || null,
          updateData.delivery_date || null
        ]);
        return result[0];
      } catch (error) {
        throw error;
      }
    }
  
    async updateStatus(id, status) {
      try {
        const result = await this.callProcedure('sp_update_order_status', [id, status]);
        return result[0];
      } catch (error) {
        throw error;
      }
    }
  
    async getOrdersWithItems(limit = 10, offset = 0) {
      try {
        return await this.callFunction('fn_get_orders_with_items', [limit, offset]);
      } catch (error) {
        throw error;
      }
    }
  
    async getOrdersByDateRange(startDate, endDate, limit = 10, offset = 0) {
      try {
        return await this.callFunction('fn_get_orders_by_date_range', [
          startDate,
          endDate,
          limit,
          offset
        ]);
      } catch (error) {
        throw error;
      }
    }
  
    async getOrderStatistics(startDate = null, endDate = null) {
      try {
        return await this.callFunction('fn_get_order_statistics', [
          startDate,
          endDate
        ]);
      } catch (error) {
        throw error;
      }
    }*/

  /**
   * Get daily summary data for quotations/orders.
   * @param {Date|string} report_date
   * @param {string|null} status
   */
  async getDailySummary(report_date = null, status = null) {
    try {
      return await this.callFunction('fn_get_daily_summary', [
        report_date,
        status
      ]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get daily summary statistics.
   * @param {Date|string} report_date
   * @param {string|null} status
   */
  async getDailySummaryStats(report_date = null, status = null) {
    try {
      return await this.callFunction('fn_get_daily_summary_stats', [
        report_date,
        status
      ]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get available status options for a specific date.
   * @param {Date|string} report_date
   */
  async getDailyStatusOptions(report_date = null) {
    try {
      return await this.callFunction('fn_get_daily_status_options', [
        report_date
      ]);
    } catch (error) {
      throw error;
    }
  }

  async updateStatus(id, status) {
      try {
        const result = await this.callProcedure('sp_update_order_status', [
          null,
          null,
          id, 
          status 
        ]);
        return result[0];
      } catch (error) {
        throw error;
      }
    }

    async getWeeklySummary(week_start_date, status = null) {
      try {
        return await this.callFunction('fn_get_weekly_summary', [
          week_start_date,
          status
        ]);
      } catch (error) {
        throw error;
      }
    }
  
    async getWeeklySummaryStats(week_start_date, status = null) {
      try {
        return await this.callFunction('fn_get_weekly_summary_stats', [
          week_start_date,
          status
        ]);
      } catch (error) {
        throw error;
      }
    }
  
    async getWeeklyStatusOptions(week_start_date) {
      try {
        return await this.callFunction('fn_get_weekly_status_options', [
          week_start_date
        ]);
      } catch (error) {
        throw error;
      }
    }

    async getYearlySummary(year, status = null) {
      try {
        return await this.callFunction('fn_get_yearly_summary', [year, status]);
      } catch (error) {
        throw error;
      }
    }

    async getYearlySummaryStats(year, status = null) {
      try {
        return await this.callFunction('fn_get_yearly_summary_stats', [year, status]);
      } catch (error) {
        throw error;
      }
    }

    async getMonthlyBreakdown(year, status = null) {
      try {
        return await this.callFunction('fn_get_monthly_breakdown', [year, status]);
      } catch (error) {
        throw error;
      }
    }

    async getYearlyStatusOptions(year) {
      try {
        return await this.callFunction('fn_get_yearly_status_options', [year]);
      } catch (error) {
        throw error;
      }
    }

    /**
   * Assigns an order to a resource manager using sp_assign_order_to_resource_manager
   * @param {string} orderId - The order ID to assign
   * @param {string} resourceManagerId - The resource manager ID
   * @returns {Object} Procedure output: { p_success, p_message }
   */
  async assignOrderToResourceManager(orderId, resourceManagerId) {
    try {
      const result = await this.callProcedure('sp_assign_order_to_resource_manager', [
        null, // p_success OUT parameter
        null, // p_message OUT parameter
        orderId,
        resourceManagerId
      ]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async findOrderdataByRM(id) {
    try {
      const result = await this.callFunction('fn_get_orders_by_resource_manager', [id]);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Order;
module.exports = Order;
