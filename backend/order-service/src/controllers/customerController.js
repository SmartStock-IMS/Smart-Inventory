const CustomerModel = require('../models/customerModel');
const Customer = new CustomerModel();

class CustomerController {
  async getAllCustomers(req, res) {
    try {
      const { page = 1, limit = 10, search, customer_type } = req.query;
      const offset = (page - 1) * limit;

      const filters = {};
      if (customer_type) filters.customer_type = customer_type;
      if (search) filters.search = search;

      const customers = await Customer.findAll(parseInt(limit), parseInt(offset), filters);

      res.status(200).json({
        success: true,
        message: 'Customers retrieved successfully',
        data: {
          customers,
          pagination: {
            page: parseInt(page),
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

  async getCustomerById(req, res) {
    try {
      const { id } = req.params;
      const customer = await Customer.findById(id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Customer retrieved successfully',
        data: { customer }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createCustomer(req, res) {
    try {
      const customerData = req.body;
      const customer = await Customer.create(customerData);

      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: { customer }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const customer = await Customer.findById(id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      const updatedCustomer = await Customer.update(id, updates);

      res.status(200).json({
        success: true,
        message: 'Customer updated successfully',
        data: { customer: updatedCustomer }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteCustomer(req, res) {
    try {
      const { id } = req.params;

      // Validate customer ID format (basic UUID validation)
      if (!id || id.length !== 36) {
        return res.status(400).json({
          success: false,
          message: 'Invalid customer ID format'
        });
      }

      // Call the stored procedure for deletion
      const result = await Customer.delete(id);

      if (!result.p_success) {
        // Check if it's a "customer not found" error or "has orders" error
        if (result.p_message.includes('does not exist')) {
          return res.status(404).json({
            success: false,
            message: result.p_message
          });
        } else if (result.p_message.includes('existing orders')) {
          return res.status(409).json({
            success: false,
            message: result.p_message,
            error_code: 'CUSTOMER_HAS_ORDERS'
          });
        } else {
          return res.status(400).json({
            success: false,
            message: result.p_message
          });
        }
      }

      res.status(200).json({
        success: true,
        message: result.p_message || 'Customer deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Internal server error: ${error.message}`
      });
    }
  }
}

module.exports = new CustomerController();
