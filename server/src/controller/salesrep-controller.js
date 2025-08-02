const db = require("../models");
const {
  salesRepSchema,
  salesRepUpdateSchema,
} = require("../validators/user-validator");

// Create a new SalesRep along with the associated User record
exports.createSalesRep = async (req, res) => {
  try {
    // Validate incoming sales rep data (which should include user details)
    const validation = salesRepSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }
    const salesRepData = validation.data;

    // Check if a user with this user_code already exists
    const existingUser = await db.User.findOne({
      where: { user_code: salesRepData.user_code },
    });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Build the User data from sales rep data
    const userData = {
      user_code: salesRepData.user_code,
      user_type_id: "001",
      username: `sales_${salesRepData.user_code}`,
      password: "SalesRep123",
      name: salesRepData.first_name + " " + salesRepData.last_name,
      address:
        salesRepData.address +
        ", " +
        salesRepData.city +
        ", " +
        salesRepData.province +
        ", " +
        salesRepData.postal_code,
      email: salesRepData.email,
      dob: "1990-01-01",
      contact: salesRepData.contact,
    };

    // Begin transaction so that both User and SalesRep records are created atomically
    const dbTransaction = await db.sequelize.transaction();
    try {
      const newUser = await db.User.create(userData, {
        transaction: dbTransaction,
      });
      const newSalesRep = await db.SalesRep.create(
        {
          emp_code: salesRepData.user_code,
          sales_area: salesRepData.sales_area,
          location: salesRepData.sales_area,
          customer_count: salesRepData.customer_count || 0,
          is_active: true,
        },
        { transaction: dbTransaction },
      );

      await dbTransaction.commit();
      res.status(201).json({
        message: "SalesRep created successfully.",
        data: { user: newUser, salesRep: newSalesRep },
      });
    } catch (error) {
      await dbTransaction.rollback();
      console.error("Error creating sales rep:", error);
      return res.status(500).json({ error: error.message });
    }
  } catch (error) {
    console.error("Error in createSalesRep:", error);
    return res.status(500).json({ error: error.message });
  }
};

// update existing sales-rep data (with user-data update)
exports.updateSalesRep = async (req, res) => {
  try {
    const { emp_code } = req.params; // capture request params

    // validate emp_code
    const salesRep = await db.SalesRep.findOne({ where: { emp_code } });
    if (!salesRep) {
      return res.status(404).json({ error: "SalesRep not found." });
    }

    // validate the request-data
    const validation = salesRepUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }
    const updatedData = validation.data;

    // TODO: modify validate return response when no changes provided
    if (Object.keys(updatedData).length === 0) {
      console.log("updatedData: ", updatedData);
      return res.status(200).json({ message: "Form submitted successfully. No changes were made." });
    }

    // update database
    const dbTransaction = await db.sequelize.transaction();
    try {
      // update users table
      const userData = {
        name: updatedData.name,
        address: updatedData.address,
        phone: updatedData.phone,
        email: updatedData.email,
      };
      await db.User.update(userData, {
        where: { user_code: emp_code },
        transaction: dbTransaction,
      });

      // update sales-rep table
      const salesRepData = {
        sales_area: updatedData.region,
        is_active: updatedData.status === "Active",
      };
      await db.SalesRep.update(salesRepData, {
        where: { emp_code: emp_code },
        transaction: dbTransaction,
      });

      await dbTransaction.commit(); // commit changes
    } catch (error) {
      await dbTransaction.rollback(); // rollback changes if any error
      console.error("Error updating sales rep: ", error);
      return res.status(500).json({ error: error.message });
    }

    // send response
    res.status(200).json({
      message: "SalesRep updated successfully.",
      data: updatedData,
    });
  } catch (error) {
    console.error("Error updating SalesRep:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete an existing SalesRep record (user remains intact)
exports.deleteSalesRep = async (req, res) => {
  try {
    const { emp_code } = req.params;
    const salesRep = await db.SalesRep.findOne({ where: { emp_code } });
    if (!salesRep) {
      return res.status(404).json({ error: "SalesRep not found." });
    }
    await salesRep.destroy();
    res.status(200).json({ message: "SalesRep deleted successfully." });
  } catch (error) {
    console.error("Error deleting SalesRep:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single SalesRep by emp_code
exports.getSalesRep = async (req, res) => {
  try {
    const { emp_code } = req.params;
    const salesRep = await db.SalesRep.findOne({
      where: { emp_code },
      include: {
        model: db.User,
        as: "users",
      },
    });
    if (!salesRep) {
      return res.status(404).json({ error: "SalesRep not found." });
    }
    res.status(200).json(salesRep);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all SalesReps
exports.getAllSalesReps = async (req, res) => {
  try {
    const salesReps = await db.SalesRep.findAll({
      include: {
        model: db.User,
        as: "users",
      },
    });
    res.status(200).json(salesReps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
