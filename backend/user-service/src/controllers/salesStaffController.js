const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const prismaUserModel = require('../models/prismaUserModel');

class SalesStaffController {
  async createSalesStaff(req, res) {
    try {
      const {
        first_name,
        last_name,
        email,
        contact,
        address,
        city,
        province,
        postal_code,
        sales_area,
        status,
        nic_no
      } = req.body;

      // Validate required fields
      if (!first_name || !last_name || !email || !contact || !address || !sales_area) {
        return res.status(400).json({
          success: false,
          message: 'Required fields missing: first_name, last_name, email, contact, address, sales_area'
        });
      }

      // Check if email already exists
      const existingUser = await prismaUserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Generate unique IDs
      const userID = uuidv4();
      const salesStaffID = `SS-${Date.now()}`;
      const username = `sales_${salesStaffID.toLowerCase()}`;
      
      // Generate default password
      const defaultPassword = 'SalesStaff123';
      const password_hash = await bcrypt.hash(defaultPassword, 10);

      // Create user first with SALES_STAFF role
      const userData = {
        userID,
        username,
        password_hash,
        role: 'SALES_STAFF', // Set role as SALES_STAFF
        first_name,
        last_name,
        email,
        phone: contact,
        address: `${address}${city ? ', ' + city : ''}${province ? ', ' + province : ''}${postal_code ? ', ' + postal_code : ''}`,
        branch: sales_area, // Use sales_area as branch
        nic: nic_no || null,
        date_of_employment: new Date(),
        performance_rating: 0.0,
        pic_url: null,
        pic: null
      };

      const newUser = await prismaUserModel.create(userData);

      // Create sales staff record linked to the user
      const salesStaffData = {
        sales_staff_id: salesStaffID,
        userID: userID,
        performance_rating: 0.0,
        date_of_employment: new Date()
      };

      const newSalesStaff = await prismaUserModel.createSalesStaff(salesStaffData);

      res.status(201).json({
        success: true,
        message: 'Sales staff created successfully',
        data: {
          user: {
            userID: newUser.userID,
            username: newUser.username,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role,
            branch: newUser.branch
          },
          salesStaff: newSalesStaff,
          defaultPassword: defaultPassword
        }
      });

    } catch (error) {
      console.error('Error creating sales staff:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create sales staff',
        error: error.message
      });
    }
  }

  async getAllSalesStaff(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * parseInt(limit);

      const salesStaff = await prismaUserModel.findAllSalesStaff(parseInt(limit), offset);

      res.status(200).json({
        success: true,
        message: 'Sales staff retrieved successfully',
        data: {
          salesStaff: salesStaff,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching sales staff:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sales staff',
        error: error.message
      });
    }
  }

  async getSalesStaffById(req, res) {
    try {
      const { id } = req.params;
      const salesStaff = await prismaUserModel.findSalesStaffById(id);

      if (!salesStaff) {
        return res.status(404).json({
          success: false,
          message: 'Sales staff not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Sales staff retrieved successfully',
        data: { salesStaff }
      });
    } catch (error) {
      console.error('Error fetching sales staff:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sales staff',
        error: error.message
      });
    }
  }

  async updateSalesStaff(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedSalesStaff = await prismaUserModel.updateSalesStaff(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Sales staff updated successfully',
        data: { salesStaff: updatedSalesStaff }
      });
    } catch (error) {
      console.error('Error updating sales staff:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update sales staff',
        error: error.message
      });
    }
  }

  async deleteSalesStaff(req, res) {
    try {
      const { id } = req.params;
      
      await prismaUserModel.deleteSalesStaff(id);

      res.status(200).json({
        success: true,
        message: 'Sales staff deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting sales staff:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete sales staff',
        error: error.message
      });
    }
  }
}

module.exports = new SalesStaffController();