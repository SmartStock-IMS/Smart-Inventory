const UserModel = require('../models/userModel');

class UserController {
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, role } = req.query;
      const offset = (page - 1) * parseInt(limit);

      const filters = {};
      if (role) filters.role = role;

      const users = await UserModel.findAll(parseInt(limit), offset, filters);

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users: users,
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

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Remove sensitive data
      delete user.password_hash;
      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Remove sensitive fields
      delete updates.password_hash;
      delete updates.id;

      const existingUser = await UserModel.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const updatedUser = await UserModel.update(id, updates);

      // Remove sensitive data
      delete updatedUser.password_hash;
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Soft delete by updating status to inactive
      await UserModel.update(id, { status: 'inactive' });

      res.status(200).json({
        success: true,
        message: 'User deactivated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getUserProfile(req, res) {
    try {
      const userId = req.headers['x-user-id'];
      const { id } = req.params;
      const user = await UserModel.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Remove sensitive data
      delete user.password_hash;
      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  async getSalesStaff(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const parsedLimit = parseInt(limit);
      const offset = (page - 1) * parsedLimit;

      const users = await UserModel.findAllSalesStaff(parsedLimit, offset);

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users: users,
          pagination: {
            page: parseInt(page),
            limit: parsedLimit
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
}

module.exports = new UserController();
