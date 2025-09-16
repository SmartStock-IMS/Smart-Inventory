const prismaUserModel = require('../models/prismaUserModel');

class UserController {
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, role } = req.query;
      const offset = (page - 1) * parseInt(limit);

      const filters = {};
      if (role) filters.role = role;

      const users = await prismaUserModel.findAll(parseInt(limit), offset, filters);

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
      const user = await prismaUserModel.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

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

      const existingUser = await prismaUserModel.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const updatedUser = await prismaUserModel.update(id, updates);

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
      const user = await prismaUserModel.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Delete user (you might want to implement soft delete instead)
      await prismaUserModel.delete(id);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
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
      const user = await prismaUserModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

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
}

module.exports = new UserController();
