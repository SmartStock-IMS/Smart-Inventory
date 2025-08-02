const db = require("../models");

exports.getDailySummary = async (req, res) => {
  try {
    const date = req.query.date;

    const start = new Date(`${date}T00:00:00Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    const quotations = await db.Quotation.findAll({
      where: {
        quotation_date: {
          [db.Sequelize.Op.gte]: start,
          [db.Sequelize.Op.lt]: end,
        }
      },
      include: {
        model: db.QuotationItem,
        as: "quotationItems",
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      data: quotations,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.qbSummary = async (req, res) => {
  try {
    const date = req.query.date;

    const start = new Date(`${date}T00:00:00Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    const invoices = await db.Invoice.findAll({
      include: [
        {
          model: db.Quotation,
          as: "invoice-quotations",
          include: [
            {
              model: db.QuotationItem,
              as: "quotationItems",
            },
            {
              model: db.Customer,
              as: "quotationCustomer"
            }
          ]
        }
      ],
      where: {
        createdAt: {
          [db.Sequelize.Op.gte]: start,
          [db.Sequelize.Op.lt]: end,
        },
      }
    })

    res.status(200).json({
      data: invoices,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};