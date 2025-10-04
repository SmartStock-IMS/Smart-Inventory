const OrderModel = require('../models/orderModel');
//const OrderItemModel = require('../models/orderItemModel');
//const CustomerModel = require('../models/customerModel');
//const inventoryService = require('../services/inventoryService');

// Create instances
const Order = new OrderModel();
//const OrderItem = new OrderItemModel();
//const Customer = new CustomerModel();

class OrderController {
  
  async getAllOrdersData(req, res) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = parseInt(req.query.offset, 10) || 0;
      const filters = {
        status: req.query.status || null,
        start_date: req.query.start_date || null,
        end_date: req.query.end_date || null
      };
      const orders = await Order.getAllOrdersData(limit, offset, filters);
      res.json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: { order }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createOrder(req, res) {
    try {
      const { customer_id, sales_staff_id, items, order_type = 'quotation', delivery_date = null } = req.body;
      // Validate required fields
      if (!customer_id || !sales_staff_id || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'customer_id, sales_staff_id, and items are required.'
        });
      }

      // Call the stored procedure via the model
      const procResult = await Order.createCustomerOrder({
        customer_id,
        sales_staff_id,
        items,
        order_type,
        delivery_date
      });

      if (!procResult.p_success) {
        return res.status(400).json({
          success: false,
          message: procResult.p_message || 'Order creation failed.'
        });
      }

      // Optionally, fetch the created order details (if needed)
      // const order = await Order.findById(procResult.p_order_id);

      res.status(201).json({
        success: true,
        message: procResult.p_message || 'Order created successfully',
        data: {
          order_id: procResult.p_order_id,
          order_total: procResult.p_order_total
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }


  async getOrdersBySalesRepId(req, res) {
    try {
      const { id } = req.params;
      const orders = await Order.findOrderdataBySalesRep(id);

      if (!orders) {
        return res.status(404).json({
          success: false,
          message: 'No orders found for this sales representative'
        });
      }

      res.status(200).json({
        success: true,
        message: 'orders retrieved successfully',
        data: { orders }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      }); 
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params; // Extract the ID from the URL parameters
      const { status } = req.body; // Extract the status from the request body

      if (!id || !status) {
        return res.status(400).json({
          success: false,
          message: 'Order ID and status are required'
        });
      }

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      await Order.updateStatus(id, status); 

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: { id, status }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
/*
  async deleteOrder(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findByPk(id, {
        include: [{ model: OrderItem, as: 'items' }]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.status === 'delivered') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete delivered orders'
        });
      }

      // Release inventory reservations
      for (const item of order.items) {
        await inventoryService.releaseReservation(
          item.product_id,
          item.variant_id,
          item.quantity
        );
      }

      // Soft delete by updating status
      await order.update({ status: 'cancelled' });

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }*/

  async getDailySummary(req, res) {
    try {
      const report_date = req.query.date || null;
      const status = req.query.status || null;
      const data = await Order.getDailySummary(report_date, status);
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching daily summary:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  async getDailySummaryStats(req, res) {
    try {
      const report_date = req.query.date || null;
      const status = req.query.status || null;
      const stats = await Order.getDailySummaryStats(report_date, status);
      res.json({ success: true, data: stats && stats[0] ? stats[0] : {} });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getDailyStatusOptions(req, res) {
    try {
      const report_date = req.query.date || null;
      const options = await Order.getDailyStatusOptions(report_date);
      res.json({ success: true, data: options.map(o => o.status) });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getWeeklySummary(req, res) {
    try {
      const week_start_date = req.query.week_start_date;
      const status = req.query.status || null;

      if (!week_start_date) {
        return res.status(400).json({
          success: false,
          message: 'week_start_date is required'
        });
      }

      const data = await Order.getWeeklySummary(week_start_date, status);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getWeeklySummaryStats(req, res) {
    try {
      const week_start_date = req.query.week_start_date;
      const status = req.query.status === "" ? null : req.query.status; // Treat empty string as null

      if (!week_start_date) {
        return res.status(400).json({
          success: false,
          message: 'week_start_date is required'
        });
      }

      const stats = await Order.getWeeklySummaryStats(week_start_date, status);
      res.json({ success: true, data: stats && stats[0] ? stats[0] : {} });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getWeeklyStatusOptions(req, res) {
    try {
      const week_start_date = req.query.week_start_date;

      if (!week_start_date) {
        return res.status(400).json({
          success: false,
          message: 'week_start_date is required'
        });
      }

      const options = await Order.getWeeklyStatusOptions(week_start_date);
      res.json({ success: true, data: options.map(o => o.status) });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getYearlySummary(req, res) {
    try {
      const year = parseInt(req.query.year, 10);
      const status = req.query.status || null;

      if (!year) {
        return res.status(400).json({
          success: false,
          message: 'Year is required'
        });
      }

      const data = await Order.getYearlySummary(year, status);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getYearlySummaryStats(req, res) {
    try {
      const year = parseInt(req.query.year, 10);
      const status = req.query.status || null;

      if (!year) {
        return res.status(400).json({
          success: false,
          message: 'Year is required'
        });
      }

      const stats = await Order.getYearlySummaryStats(year, status);
      res.json({ success: true, data: stats && stats[0] ? stats[0] : {} });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMonthlyBreakdown(req, res) {
    try {
      const year = parseInt(req.query.year, 10);
      const status = req.query.status || null;

      if (!year) {
        return res.status(400).json({
          success: false,
          message: 'Year is required'
        });
      }

      const data = await Order.getMonthlyBreakdown(year, status);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getYearlyStatusOptions(req, res) {
    try {
      const year = parseInt(req.query.year, 10);

      if (!year) {
        return res.status(400).json({
          success: false,
          message: 'Year is required'
        });
      }

      const options = await Order.getYearlyStatusOptions(year);
      res.json({ success: true, data: options.map(o => o.status) });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async assignOrderToResourceManager(req, res) {
    try {
      const { orderId, resourceManagerId } = req.body;

      // Validate required fields
      if (!orderId || !resourceManagerId) {
        return res.status(400).json({
          success: false,
          message: 'orderId and resourceManagerId are required'
        });
      }

      // Call the stored procedure via the model
      const result = await Order.assignOrderToResourceManager(orderId, resourceManagerId);

      if (!result.p_success) {
        return res.status(400).json({
          success: false,
          message: result.p_message || 'Failed to assign order to resource manager'
        });
      }

      res.status(200).json({
        success: true,
        message: result.p_message || 'Order successfully assigned to resource manager',
        data: {
          orderId,
          resourceManagerId,
          status: 'inprogress'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getOrdersByRMId(req, res) {
    try {
      const { id } = req.params;
      const orders = await Order.findOrderdataByRM(id);

      if (!orders) {
        return res.status(404).json({
          success: false,
          message: 'No orders assigned for this resource manager'
        });
      }

      res.status(200).json({
        success: true,
        message: 'orders retrieved successfully',
        data: { orders }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      }); 
    }
  }
}

module.exports = new OrderController();
