const db = require("../models");

exports.getDashboardData = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (isNaN(from) || isNaN(to)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const data = await db.SomeModel.findAll({
      where: {
        date: {
          [db.Sequelize.Op.between]: [from, to],
        },
      },
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getIncomeData = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (isNaN(from) || isNaN(to)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Fetch and aggregate income data from quotations within the date range
    const incomeData = await db.Quotation.findAll({
      attributes: [
        [db.Sequelize.fn('DATE_TRUNC', 'month', db.Sequelize.col('quotation_date')), 'month'],
        [db.Sequelize.fn('SUM', db.Sequelize.col('net_total')), 'totalIncome']
      ],
      where: {
        quotation_date: {
          [db.Sequelize.Op.between]: [from, to],
        },
      },
      group: ['month'],
      order: [['month', 'ASC']]
    });

    res.status(200).json(incomeData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPopularProducts = async (req, res) => {
  try {
    const popularProducts = await db.Product.findAll({
      attributes: [
        "id",
        "name",
        "category",
        "main_image",
        [
          db.sequelize.literal(`(
            SELECT COALESCE(SUM("quotationItems"."item_qty"), 0)
            FROM "QuotationItems" AS "quotationItems"
            INNER JOIN "Variants" AS "variants" ON "variants"."product_code" = "quotationItems"."item_code"
            WHERE "variants"."product_id" = "Product"."id"
          )`),
          "totalSold"
        ]
      ],
      // Only include products where the total sold is greater than 0
      where: db.sequelize.literal(`(
        SELECT COALESCE(SUM("quotationItems"."item_qty"), 0)
        FROM "QuotationItems" AS "quotationItems"
        INNER JOIN "Variants" AS "variants" ON "variants"."product_code" = "quotationItems"."item_code"
        WHERE "variants"."product_id" = "Product"."id"
      ) > 0`),
      order: [[db.sequelize.literal('"totalSold"'), "DESC"]],
      limit: 10,
    });

    res.status(200).json({ success: true, data: popularProducts });
  } catch (error) {
    console.error("Error in getPopularProducts:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


exports.getOverviewData = async (req, res) => {
  try {
    const { Op } = db.Sequelize;
    const { timePeriod } = req.query;
    let quotationDateFilter = {};

    if (timePeriod === "This Month") {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
      quotationDateFilter = { quotation_date: { [Op.between]: [startOfMonth, endOfMonth] } };
    } else if (timePeriod === "This Year") {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      const endOfYear = new Date(new Date().getFullYear(), 11, 31);
      quotationDateFilter = { quotation_date: { [Op.between]: [startOfYear, endOfYear] } };
    }

    const totalCustomers = await db.Customer.count();

    const incomeResult = await db.Quotation.findOne({
      attributes: [
        [db.Sequelize.fn("COALESCE", db.Sequelize.fn("SUM", db.Sequelize.col("net_total")), 0), "totalIncome"]
      ],
      where: Object.keys(quotationDateFilter).length ? quotationDateFilter : {},
      raw: true,
    });
    const totalIncome = incomeResult.totalIncome;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const bestSalesRepsData = await db.Quotation.findAll({
      attributes: [
        "sales_rep_id",
        [db.Sequelize.fn("SUM", db.Sequelize.col("net_total")), "totalSales"]
      ],
      where: {
        quotation_date: { [Op.between]: [startOfMonth, endOfMonth] }
      },
      group: ["sales_rep_id"],
      order: [[db.Sequelize.col("totalSales"), "DESC"]],
      limit: 4,
      raw: true,
    });

    const bestSalesReps = await Promise.all(
      bestSalesRepsData.map(async (rep) => {
        const repIdStr = rep.sales_rep_id.toString();
        const salesRepRecord = await db.SalesRep.findOne({
          where: { emp_code: { [Op.eq]: repIdStr } },
          include: [{
            model: db.User,
            as: "users",
            attributes: ["name"],
          }],
          raw: true,
          nest: true,
        });
        return {
          sales_rep_id: rep.sales_rep_id,
          totalSales: rep.totalSales,
          name: salesRepRecord && salesRepRecord.users
            ? salesRepRecord.users.name
            : rep.sales_rep_id,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        totalIncome,
        bestSalesReps,
      }
    });
  } catch (error) {
    console.error("Error in getOverviewData:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};