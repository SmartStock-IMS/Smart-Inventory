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

  /*async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findByPk(id, {
        include: [
          {
            model: Customer,
            as: 'customer'
          },
          {
            model: OrderItem,
            as: 'items'
          }
        ]
      });

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
  }*/

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
/*
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await Order.findByPk(id, {
        include: [{ model: OrderItem, as: 'items' }]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Handle inventory based on status change
      if (status === 'delivered' && order.status !== 'delivered') {
        // Deduct from actual inventory when delivered
        for (const item of order.items) {
          // This would need the inventory ID - simplified for demo
          // await inventoryService.updateInventory(inventoryId, item.quantity, 'subtract');
        }
      } else if (status === 'cancelled' && order.status !== 'cancelled') {
        // Release reservations when cancelled
        for (const item of order.items) {
          await inventoryService.releaseReservation(
            item.product_id,
            item.variant_id,
            item.quantity
          );
        }
      }

      await order.update({ status });

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: { order }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

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
}

module.exports = new OrderController();
