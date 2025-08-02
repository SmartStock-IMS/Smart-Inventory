const db = require("../models");
const jwt = require("jsonwebtoken");
const { customerSchema } = require("../validators/user-validator");

exports.creatUser = async (req, res) => {
  try {
    const { user_type_id, ...userReqData } = req.body;
    if (!user_type_id) {
      return res.status(400).json({ error: "User type is invalid." });
    }

    try {
      const user = await db.User.findOne({
        where: { user_code: userReqData.user_code },
      });
      if (user) {
        return res.status(400).json({ error: "User already exist" });
      }
    } catch (error) {
      return res.status(400).json({ error: `Error checking user: ${error}` });
    }

    let customerData;
    if (user_type_id === "003") {
      const customerValidation = customerSchema.safeParse(userReqData);
      if (!customerValidation.success) {
        return res.status(400).json({
          errors: customerValidation.error.errors,
        });
      }
      customerData = customerValidation.data;
    }
    // TODO: add Sales Rep and Accountant validation & creation

    const userData = {
      user_code: customerData.user_code,
      user_type_id: user_type_id,
      username: "Customer",
      password: "Customer123",
      name: customerData.first_name + " " + customerData.last_name,
      address:
        customerData.address_line1 +
        ", " +
        customerData.address_line2 +
        ", " +
        customerData.city +
        ", " +
        customerData.district +
        ", " +
        customerData.province +
        ", " +
        customerData.postal_code,
      email: customerData.email,
      dob: "1990-01-01",
      contact: customerData.contact1,
    };

    const userTransaction = await db.sequelize.transaction();
    try {
      const user = await db.User.create(userData, {
        transaction: userTransaction,
      });
      const customer = await db.Customer.create(customerData, {
        transaction: userTransaction,
      });
      await userTransaction.commit();
    } catch (error) {
      await userTransaction.rollback();
      console.error("Error creating user: ", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      message: "User added successfully.",
      data: {
        user: userData,
        customer: customerData,
      },
    });
  } catch (error) {
    console.log("Error creating user (outside): ", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await db.User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const {email} = req.query;

    if (!email) {
      return res.status(400).json({message: "User email is required"});
    }
    const user = await db.User.findOne({
      where: { email: email },
    });

    const userData = {
      user_code: user.user_code,
      username: user.username,
      email: user.email,
    }
    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const users = await db.Customer.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//Bishan Kulasekara
// Create a new customer
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
    const existing = await db.Customer.findOne({
      where: { email: customerData.email },
    });
    if (existing) {
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
      const user = await db.User.create(userData, { transaction: userTransaction });
      const customer = await db.Customer.create(customerData, { transaction: userTransaction });
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


// Update an existing customer
exports.updateCustomer = async (req, res) => {
  try {
    const { user_code } = req.params;
    const customer = await db.Customer.findOne({ where: { user_code } });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found." });
    }
    const customerValidation = customerSchema.safeParse(req.body);
    if (!customerValidation.success) {
      return res.status(400).json({
        errors: customerValidation.error.errors,
      });
    }
    const updatedData = customerValidation.data;
    await customer.update(updatedData);
    res.status(200).json({
      message: "Customer updated successfully.",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an existing customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { user_code } = req.params;
    const customer = await db.Customer.findOne({ where: { user_code } });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found." });
    }
    await customer.destroy();
    res.status(200).json({ message: "Customer deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single customer by user_code
exports.getCustomer = async (req, res) => {
  try {
    const { user_code } = req.params;
    const customer = await db.Customer.findOne({ where: { user_code } });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found." });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};