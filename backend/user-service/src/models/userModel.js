const BaseModel = require('./baseModel');
const bcrypt = require('bcryptjs');

class User extends BaseModel {
  constructor() {
    super('users');
  }

  async findAll(limit = 10, offset = 0, filters = {}) {
    try {
      return await this.callFunction('fn_get_users', [
        limit,
        offset,
        filters.role || null
      ]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find user by ID with full details
   */
  async findById(id) {
    try {
      const result = await this.callFunction('fn_get_user_by_id', [id]);
      return result[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    try {
      const result = await this.callFunction('fn_get_user_by_email', [email]);
      return result[0] || null;
    } catch (error) {
      throw error;
    }
  }

  async findByRole(role) {
    try {
      const result = await this.callFunction('fn_get_user_by_role', [role]);
      return result[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new user with contacts and addresses
   * Note: Since your schema doesn't have user_contacts/user_addresses tables,
   * this simplified version only creates the user
   */
  async create(userData, contacts = [], addresses = []) {
  try {
    // Hash password before calling procedure
    const saltRounds = 12;
    userData.password_hash = await bcrypt.hash(userData.password, saltRounds);
    delete userData.password; // Remove plain password

    // Generate email if not provided (since email is required in schema)
    if (!userData.email) {
      userData.email = `${userData.username}@temp.com`;
    }

    const result = await this.callProcedure('sp_create_user', [
      userData.username,
      userData.password_hash,
      userData.role,
      userData.first_name,
      userData.last_name,
      userData.pic_url || null,
      userData.nic || null,
      userData.email,
      userData.phone || null,
      userData.address || null,
      userData.branch || null,
      userData.performance_rating || null,
      userData.date_of_employment || null
    ]);
    
    return result[0];
  } catch (error) {
    throw error;
  }
}

  /**
   * Create user with contacts and addresses (transaction-based)
   */
  async createWithContacts(userData, contacts = [], addresses = []) {
    try {
      return await this.create(userData, contacts, addresses);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user information
   */
  async update(id, userData) {
    try {
      // If password is being updated, hash it
      if (userData.password) {
        const saltRounds = 12;
        userData.password_hash = await bcrypt.hash(userData.password, saltRounds);
        delete userData.password;
      }

      const result = await this.callProcedure('sp_update_user', [
        id,
        JSON.stringify(userData)
      ]);
      
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user (soft delete)
   */
  async delete(id) {
    try {
      const result = await this.callProcedure('sp_delete_user', [id]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user with full details
   */
  async getUserWithDetails(id) {
    try {
      const result = await this.callFunction('fn_get_user_with_details', [id]);
      return result[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate user password
   */
  async validatePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(id) {
    try {
      const result = await this.callProcedure('sp_update_user_last_login', [id]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(id, currentPassword, newPassword) {
    try {
      // Get user to verify current password
      const user = await this.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await this.validatePassword(currentPassword, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      const result = await this.callProcedure('sp_change_user_password', [
        id,
        newPasswordHash
      ]);
      
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Activate user account
   */
  async activate(id) {
    try {
      const result = await this.callProcedure('sp_activate_user', [id]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deactivate user account
   */
  async deactivate(id) {
    try {
      const result = await this.callProcedure('sp_deactivate_user', [id]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search users by name, username, or email
   */
  async search(searchQuery, limit = 50) {
    try {
      return await this.callFunction('fn_search_users', [searchQuery, limit]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Count users with filters
   */
  async count(filters = {}) {
    try {
      return await this.callScalarFunction('fn_count_users', [
        filters.role || null,
        filters.status || null  // Changed from is_active to status
      ]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get users by role
   */
  async findByRole(role, limit = 50, offset = 0) {
    try {
      return await this.callFunction('fn_get_users_by_role', [
        role,
        limit,
        offset
      ]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get active users only
   */
  async findActive(limit = 50, offset = 0) {
    try {
      return await this.callFunction('fn_get_active_users', [
        limit,
        offset
      ]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getStats() {
    try {
      const result = await this.callFunction('fn_get_user_stats', []);
      return result[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if username exists
   */
  async usernameExists(username, excludeId = null) {
    try {
      const result = await this.callScalarFunction('fn_username_exists', [
        username,
        excludeId
      ]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email, excludeId = null) {
    try {
      const result = await this.callScalarFunction('fn_email_exists', [
        email,
        excludeId
      ]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user activity log
   */
  async getActivityLog(userId, limit = 100, offset = 0) {
    try {
      return await this.callFunction('fn_get_user_activity_log', [
        userId,
        limit,
        offset
      ]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset user password (admin function)
   */
  async resetPassword(id, newPassword) {
    try {
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      const result = await this.callProcedure('sp_reset_user_password', [
        id,
        passwordHash
      ]);
      
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async findAllSalesStaff(limit = 10, offset = 0) {
    try {
      return await this.callFunction('fn_get_sales_reps', [
        limit,
        offset
      ]);
    } catch (error) {
      throw error;
    }
  }

  async findAllResourceManagers(limit = 10, offset = 0) {
    try {
      return await this.callFunction('fn_get_resource_managers', [
        limit,
        offset
      ]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update resource manager using sp_update_resource_manager stored procedure
   * @param {string} resourceManagerId - The resource manager UUID
   * @param {Object} updateData - The update data
   * @returns {Object} Procedure output: { p_success, p_message }
   */
  async updateResourceManager(resourceManagerId, updateData) {
    try {
      const result = await this.callProcedure('sp_update_resource_manager', [
        null, // p_success OUT parameter
        null, // p_message OUT parameter
        resourceManagerId,
        updateData.first_name || null,
        updateData.last_name || null,
        updateData.email || null,
        updateData.phone || null,
        updateData.address || null,
        updateData.branch || null,
        updateData.performance_rating || null
      ]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete resource manager using sp_delete_resource_manager stored procedure
   * @param {string} resourceManagerId - The resource manager UUID
   * @returns {Object} Procedure output: { p_success, p_message }
   */
  async deleteResourceManager(resourceManagerId) {
    try {
      const result = await this.callProcedure('sp_delete_resource_manager', [
        null, // p_success OUT parameter
        null, // p_message OUT parameter
        resourceManagerId
      ]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId, status = null, limit = 50, offset = 0) {
    try {
      return await this.callFunction('fn_get_user_notifications', [
        userId,
        status,
        limit,
        offset
      ]);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new User();