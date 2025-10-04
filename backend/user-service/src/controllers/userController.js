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

  async getResourceManager(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const parsedLimit = parseInt(limit);
      const offset = (page - 1) * parsedLimit;

      const users = await UserModel.findAllResourceManagers(parsedLimit, offset);

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

  async updateResourceManager(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validate resource manager ID format (basic UUID validation)
      if (!id || id.length !== 36) {
        return res.status(400).json({
          success: false,
          message: 'Invalid resource manager ID format'
        });
      }

      // Validate performance rating if provided
      if (updateData.performance_rating !== undefined && updateData.performance_rating !== null) {
        const rating = parseFloat(updateData.performance_rating);
        if (isNaN(rating) || rating < 0 || rating > 10) {
          return res.status(400).json({
            success: false,
            message: 'Performance rating must be a number between 0 and 10'
          });
        }
        updateData.performance_rating = rating;
      }

      // Validate email format if provided
      if (updateData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateData.email)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid email format'
          });
        }
      }

      // Call the stored procedure for update
      const result = await UserModel.updateResourceManager(id, updateData);

      if (!result.p_success) {
        // Check if it's a "not found" error or "unique constraint" error
        if (result.p_message.includes('does not exist')) {
          return res.status(404).json({
            success: false,
            message: result.p_message
          });
        } else if (result.p_message.includes('already exists')) {
          return res.status(409).json({
            success: false,
            message: result.p_message,
            error_code: 'DUPLICATE_DATA'
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
        message: result.p_message || 'Resource manager updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Internal server error: ${error.message}`
      });
    }
  }

  async deleteResourceManager(req, res) {
    try {
      const { id } = req.params;

      // Validate resource manager ID format (basic UUID validation)
      if (!id || id.length !== 36) {
        return res.status(400).json({
          success: false,
          message: 'Invalid resource manager ID format'
        });
      }

      // Call the stored procedure for deletion
      const result = await UserModel.deleteResourceManager(id);

      if (!result.p_success) {
        // Check if it's a "not found" error or "has dependencies" error
        if (result.p_message.includes('does not exist')) {
          return res.status(404).json({
            success: false,
            message: result.p_message
          });
        } else if (result.p_message.includes('stock movements') || result.p_message.includes('orders')) {
          return res.status(409).json({
            success: false,
            message: result.p_message,
            error_code: 'HAS_DEPENDENCIES'
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
        message: result.p_message || 'Resource manager deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Internal server error: ${error.message}`
      });
    }
  }
}

module.exports = new UserController();
