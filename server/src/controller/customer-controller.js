const db = require("../models");
const { customerSchema } = require("../validators/customer-validator");

exports.createCustomer = async (req, res) => {
  try {
    const customerValidation = customerSchema.safeParse(req.body);
    if (!customerValidation.success) {
      return res.status(400).json({
        errors: customerValidation.error.errors,
      });
    }
    const customerData = customerValidation.data;

    // Check if the customer already exists
    const customer = await db.Customer.findOne({
      where: { email: customerData.email, user_code: customerData.user_code },
    });
    if (customer) {
      return res.status(400).json({ error: "Customer already exists." });
    }

    // Build the user data based on the customer information.
    const userData = {
      user_code: customerData.user_code,
      user_type_id: "003", // Assuming "003" represents a customer type
      username: "Customer",
      password: "Customer123", // default password; change per your requirements
      name: customerData.first_name + " " + customerData.last_name,
      address:
        customerData.address_line1 +
        (customerData.address_line2 ? ", " + customerData.address_line2 : "") +
        ", " +
        customerData.city +
        ", " +
        customerData.district +
        ", " +
        customerData.province +
        ", " +
        customerData.postal_code,
      email: customerData.email,
      dob: "1990-01-01", // default DOB
      contact: customerData.contact1,
    };

    // Begin a transaction so both User and Customer records are created atomically
    const userTransaction = await db.sequelize.transaction();
    try {
      const user = await db.User.create(userData, {
        transaction: userTransaction,
      });
      const customer = await db.Customer.create(customerData, {
        transaction: userTransaction,
      });
      await userTransaction.commit();

      res.status(201).json({
        message: "Customer created successfully.",
        data: { user, customer },
      });
    } catch (error) {
      await userTransaction.rollback();
      console.error("Error creating user and customer: ", error);
      return res.status(500).json({ error: error.message });
    }
  } catch (error) {
    console.error("Error in createCustomer: ", error);
    return res.status(500).json({ error: error.message });
  }
};

// author: Bishan Kulasekara
exports.deleteCustomer = async (req, res) => {
  try {
    const userCode = req.params.user_code;
    const customer = await db.Customer.findOne({
      where: { user_code: userCode },
    });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found." });
    }

    await customer.destroy();
    res.status(200).json({ message: "Customer deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const { cursor, limit } = req.query;
    const whereClause = cursor ? { id: { [db.Sequelize.Op.gt]: cursor } } : {};

    const customers = await db.Customer.findAll({
      where: whereClause,
      order: [["updatedAt", "DESC"]],
      limit: limit ? limit : 25,
    });

    const nextCursor =
      customers.length > 0 ? customers[customers.length - 1].id : null;

    res.status(200).json({
      message: "Customers retrieve successful.",
      customers: customers,
      nextCursor: nextCursor,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await db.Customer.findAll({
      order: [["updatedAt", "DESC"]],
    });

    res.status(200).json({
      message: "Customers retrieve successful.",
      customers: customers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCustomerByUserCode = async (req, res) => {
  try {
    const userCode = req.params.user_code;

    const customer = await db.Customer.findOne({
      where: { user_code: userCode },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found." });
    }

    res.status(200).json({
      message: "Customers retrieve successfully.",
      customer,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
