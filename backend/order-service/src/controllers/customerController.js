
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
      const customer = await Customer.findById(id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      await Customer.delete(id);

      res.status(200).json({
        success: true,
        message: 'Customer deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new CustomerController();
