
const CustomerModel = require('../models/customerModel');
const Customer = new CustomerModel();

class CustomerController {
  async getAllCustomers(req, res) {
    try {
      console.log('=== GET ALL CUSTOMERS REQUEST ===');
      console.log('Query params:', JSON.stringify(req.query, null, 2));
      console.log('Headers:', JSON.stringify(req.headers, null, 2));
      console.log('================================');
      
      const { page = 1, limit = 50, search, customer_type } = req.query; // Increased default limit
      const offset = (page - 1) * limit;

      const filters = {};
      if (customer_type) filters.customer_type = customer_type;
      if (search) filters.search = search;

      const customers = await Customer.findAll(parseInt(limit), parseInt(offset), filters);

      console.log('=== CUSTOMERS FETCHED ===');
      console.log('Number of customers:', customers.length);
      console.log('First customer sample:', customers[0] ? JSON.stringify(customers[0], null, 2) : 'No customers found');
      console.log('========================');

      res.status(200).json({
        success: true,
        message: 'Customers retrieved successfully',
        data: {
          customers,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: customers.length
          }
        }
      });
    } catch (error) {
      console.error('Error in getAllCustomers:', error);
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
      console.log('=== CREATE CUSTOMER REQUEST ===');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      console.log('Request headers:', JSON.stringify(req.headers, null, 2));
      console.log('==============================');
      
      const customerData = req.body;
      
      // Validate required fields
      if (!customerData.first_name || !customerData.last_name || !customerData.email) {
        return res.status(400).json({
          success: false,
          message: 'First name, last name, and email are required'
        });
      }

      // Check if email already exists
      const existingCustomer = await Customer.findByEmail(customerData.email);
      if (existingCustomer) {
        return res.status(409).json({
          success: false,
          message: 'Customer with this email already exists'
        });
      }

      const customer = await Customer.create(customerData);

      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: { customer }
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create customer'
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

  async getNextCustomerId(req, res) {
    try {
      const nextId = await Customer.generateCustomerId();
      
      res.status(200).json({
        success: true,
        message: 'Next customer ID generated successfully',
        data: { nextCustomerId: nextId }
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
