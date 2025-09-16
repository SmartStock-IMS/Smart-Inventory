const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

class PrismaUserModel {
  /**
   * Find user by email
   */
  async findByEmail(email) {
    try {
      const user = await prisma.user.findFirst({
        where: { email }
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findById(id) {
    try {
      const user = await prisma.user.findUnique({
        where: { userID: id }
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all users with pagination
   */
  async findAll(limit = 10, offset = 0, filters = {}) {
    try {
      const where = {};
      if (filters.role) {
        where.role = filters.role;
      }

      const users = await prisma.user.findMany({
        where,
        skip: offset,
        take: limit,
        select: {
          userID: true,
          username: true,
          role: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          address: true,
          branch: true,
          nic: true,
          date_of_employment: true,
          performance_rating: true,
          pic_url: true
        }
      });
      return users;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new user
   */
  async create(userData) {
    try {
      // Hash password
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(userData.password, saltRounds);

      // Map role to Prisma enum
      let prismaRole;
      switch (userData.role?.toLowerCase()) {
        case 'admin':
          prismaRole = 'ADMIN';
          break;
        case 'inventory_manager':
        case 'manager':
          prismaRole = 'INVENTORY_MANAGER';
          break;
        case 'sales_staff':
        case 'user':
          prismaRole = 'SALES_STAFF';
          break;
        case 'resource_manager':
          prismaRole = 'RESOURCE_MANAGER';
          break;
        default:
          prismaRole = 'SALES_STAFF'; // Default fallback
      }

      // Create user data
      const userCreateData = {
        userID: uuidv4(),
        username: userData.username || userData.email,
        password_hash,
        role: prismaRole,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone: userData.phone || '',
        address: userData.address || '',
        branch: userData.branch || 'Main Branch',
        date_of_employment: userData.date_of_employment ? new Date(userData.date_of_employment) : new Date(),
        performance_rating: userData.performance_rating || 0,
        pic_url: userData.pic_url || null,
        pic: userData.pic || null,
        nic: userData.nic || null
      };

      const user = await prisma.user.create({
        data: userCreateData,
        select: {
          userID: true,
          username: true,
          role: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          address: true,
          branch: true,
          nic: true,
          date_of_employment: true,
          performance_rating: true,
          pic_url: true
        }
      });

      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async update(id, userData) {
    try {
      const updateData = { ...userData };
      
      // Hash password if provided
      if (userData.password) {
        const saltRounds = 12;
        updateData.password_hash = await bcrypt.hash(userData.password, saltRounds);
        delete updateData.password;
      }

      // Convert date_of_employment to Date object if provided
      if (userData.date_of_employment) {
        updateData.date_of_employment = new Date(userData.date_of_employment);
      }

      // Map role to Prisma enum if provided
      if (userData.role) {
        let prismaRole;
        switch (userData.role?.toLowerCase()) {
          case 'admin':
            prismaRole = 'ADMIN';
            break;
          case 'inventory_manager':
          case 'manager':
            prismaRole = 'INVENTORY_MANAGER';
            break;
          case 'sales_staff':
          case 'user':
            prismaRole = 'SALES_STAFF';
            break;
          case 'resource_manager':
            prismaRole = 'RESOURCE_MANAGER';
            break;
          default:
            prismaRole = 'SALES_STAFF'; // Default fallback
        }
        updateData.role = prismaRole;
      }

      const user = await prisma.user.update({
        where: { userID: id },
        data: updateData,
        select: {
          userID: true,
          username: true,
          role: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          address: true,
          branch: true,
          nic: true,
          date_of_employment: true,
          performance_rating: true,
          pic_url: true
        }
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user
   */
  async delete(id) {
    try {
      await prisma.user.delete({
        where: { userID: id }
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate password
   */
  async validatePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update last login (if you want to track this)
   */
  async updateLastLogin(id) {
    try {
      // You can add a lastLogin field to your schema if needed
      // For now, this is a placeholder
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PrismaUserModel();