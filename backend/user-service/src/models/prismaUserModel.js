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

  /**
   * Get total user count
   */
  async getUserCount() {
    try {
      return await prisma.user.count();
    } catch (error) {
      console.error('Error getting user count:', error);
      throw error;
    }
  }

  /**
   * Create sales staff
   */
  async createSalesStaff(salesStaffData) {
    try {
      const salesStaff = await prisma.salesStaff.create({
        data: salesStaffData,
        include: {
          user: {
            select: {
              userID: true,
              username: true,
              first_name: true,
              last_name: true,
              email: true,
              phone: true,
              role: true,
              branch: true
            }
          }
        }
      });
      return salesStaff;
    } catch (error) {
      console.error('Error creating sales staff:', error);
      throw error;
    }
  }

  /**
   * Find all sales staff with pagination
   */
  async findAllSalesStaff(limit = 10, offset = 0) {
    try {
      const salesStaff = await prisma.salesStaff.findMany({
        skip: offset,
        take: limit,
        include: {
          user: {
            select: {
              userID: true,
              username: true,
              first_name: true,
              last_name: true,
              email: true,
              phone: true,
              role: true,
              branch: true,
              address: true,
              nic: true,
              date_of_employment: true,
              performance_rating: true
            }
          }
        }
      });
      return salesStaff;
    } catch (error) {
      console.error('Error finding sales staff:', error);
      throw error;
    }
  }

  /**
   * Find sales staff by ID
   */
  async findSalesStaffById(id) {
    try {
      const salesStaff = await prisma.salesStaff.findFirst({
        where: {
          OR: [
            { sales_staff_id: id },
            { userID: id }
          ]
        },
        include: {
          user: {
            select: {
              userID: true,
              username: true,
              first_name: true,
              last_name: true,
              email: true,
              phone: true,
              role: true,
              branch: true,
              address: true,
              nic: true,
              date_of_employment: true,
              performance_rating: true
            }
          }
        }
      });
      return salesStaff;
    } catch (error) {
      console.error('Error finding sales staff by ID:', error);
      throw error;
    }
  }

  /**
   * Update sales staff
   */
  async updateSalesStaff(id, updateData) {
    try {
      // Separate user data from sales staff data
      const { first_name, last_name, email, phone, address, nic, branch, ...salesStaffData } = updateData;
      
      const userData = {};
      if (first_name) userData.first_name = first_name;
      if (last_name) userData.last_name = last_name;
      if (email) userData.email = email;
      if (phone) userData.phone = phone;
      if (address) userData.address = address;
      if (nic) userData.nic = nic;
      if (branch) userData.branch = branch;

      // Update both user and sales staff data in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Find sales staff first
        const salesStaff = await tx.salesStaff.findFirst({
          where: {
            OR: [
              { sales_staff_id: id },
              { userID: id }
            ]
          }
        });

        if (!salesStaff) {
          throw new Error('Sales staff not found');
        }

        // Update user data if provided
        if (Object.keys(userData).length > 0) {
          await tx.user.update({
            where: { userID: salesStaff.userID },
            data: userData
          });
        }

        // Update sales staff data if provided
        if (Object.keys(salesStaffData).length > 0) {
          await tx.salesStaff.update({
            where: { sales_staff_id: salesStaff.sales_staff_id },
            data: salesStaffData
          });
        }

        // Return updated sales staff with user data
        return await tx.salesStaff.findUnique({
          where: { sales_staff_id: salesStaff.sales_staff_id },
          include: {
            user: {
              select: {
                userID: true,
                username: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                role: true,
                branch: true,
                address: true,
                nic: true,
                date_of_employment: true,
                performance_rating: true
              }
            }
          }
        });
      });

      return result;
    } catch (error) {
      console.error('Error updating sales staff:', error);
      throw error;
    }
  }

  /**
   * Delete sales staff
   */
  async deleteSalesStaff(id) {
    try {
      await prisma.$transaction(async (tx) => {
        // Find sales staff first
        const salesStaff = await tx.salesStaff.findFirst({
          where: {
            OR: [
              { sales_staff_id: id },
              { userID: id }
            ]
          }
        });

        if (!salesStaff) {
          throw new Error('Sales staff not found');
        }

        // Delete sales staff record
        await tx.salesStaff.delete({
          where: { sales_staff_id: salesStaff.sales_staff_id }
        });

        // Delete user record
        await tx.user.delete({
          where: { userID: salesStaff.userID }
        });
      });
    } catch (error) {
      console.error('Error deleting sales staff:', error);
      throw error;
    }
  }
}

module.exports = new PrismaUserModel();