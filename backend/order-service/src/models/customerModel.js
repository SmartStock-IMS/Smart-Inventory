const prisma = require('../config/prisma');

class Customer {
  constructor() {
    this.model = prisma.customer;
  }

  async findAll(limit = 10, offset = 0, filters = {}) {
    try {
      const where = {};
      
      // Add search filter
      if (filters.search) {
        where.OR = [
          { customer_id: { contains: filters.search, mode: 'insensitive' } },
          { first_name: { contains: filters.search, mode: 'insensitive' } },
          { last_name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      // Add status filter
      if (filters.status) {
        where.status = filters.status;
      }

      const customers = await this.model.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { created_at: 'desc' }
      });

      return customers;
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const customer = await this.model.findUnique({
        where: { customer_id: id }
      });
      return customer;
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const customer = await this.model.findFirst({
        where: { email: email }
      });
      return customer;
    } catch (error) {
      throw error;
    }
  }

  async create(customerData) {
    try {
      // Generate customer ID if not provided
      if (!customerData.customer_id) {
        customerData.customer_id = await this.generateCustomerId();
      }

      const customer = await this.model.create({
        data: {
          customer_id: customerData.customer_id,
          first_name: customerData.first_name,
          last_name: customerData.last_name,
          email: customerData.email,
          contact_no: customerData.contact1 || customerData.contact_no,
          contact2: customerData.contact2 || null,
          address: customerData.address_line1 || customerData.address,
          profile_pic: customerData.profile_pic || customerData.photo || null,
          status: customerData.status || 'ACTIVE',
          notes: customerData.note || customerData.notes || null
        }
      });

      return customer;
    } catch (error) {
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const customer = await this.model.update({
        where: { customer_id: id },
        data: {
          ...(updateData.first_name && { first_name: updateData.first_name }),
          ...(updateData.last_name && { last_name: updateData.last_name }),
          ...(updateData.email && { email: updateData.email }),
          ...(updateData.contact_no && { contact_no: updateData.contact_no }),
          ...(updateData.contact1 && { contact_no: updateData.contact1 }),
          ...(updateData.contact2 && { contact2: updateData.contact2 }),
          ...(updateData.address && { address: updateData.address }),
          ...(updateData.address_line1 && { address: updateData.address_line1 }),
          ...(updateData.profile_pic && { profile_pic: updateData.profile_pic }),
          ...(updateData.photo && { profile_pic: updateData.photo }),
          ...(updateData.status && { status: updateData.status }),
          ...(updateData.notes && { notes: updateData.notes }),
          ...(updateData.note && { notes: updateData.note })
        }
      });
      return customer;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.model.delete({
        where: { customer_id: id }
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  async softDelete(id) {
    try {
      await this.model.update({
        where: { customer_id: id },
        data: { status: 'INACTIVE' }
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  async generateCustomerId() {
    try {
      // Get the latest customer to determine the next ID
      const latestCustomer = await this.model.findFirst({
        where: {
          customer_id: {
            startsWith: 'CUS'
          }
        },
        orderBy: {
          customer_id: 'desc'
        }
      });

      if (!latestCustomer) {
        return 'CUS00001';
      }

      // Extract number from customer_id (e.g., 'CUS00001' -> 1)
      const lastNumber = parseInt(latestCustomer.customer_id.substring(3));
      const nextNumber = lastNumber + 1;
      
      // Format with leading zeros (e.g., 1 -> 'CUS00001')
      return `CUS${nextNumber.toString().padStart(5, '0')}`;
    } catch (error) {
      throw error;
    }
  }

  async getCustomerOrderHistory(customerId, limit = 10, offset = 0) {
    try {
      const orders = await prisma.customerOrder.findMany({
        where: { customer_id: customerId },
        take: limit,
        skip: offset,
        orderBy: { created_at: 'desc' },
        include: {
          orderItems: {
            include: {
              product: true
            }
          }
        }
      });
      return orders;
    } catch (error) {
      throw error;
    }
  }

  async getCustomerStatistics(customerId) {
    try {
      const stats = await prisma.customerOrder.aggregate({
        where: { customer_id: customerId },
        _count: { order_id: true },
        _sum: { total_amount: true }
      });
      
      return {
        total_orders: stats._count.order_id || 0,
        total_amount: stats._sum.total_amount || 0
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Customer;
