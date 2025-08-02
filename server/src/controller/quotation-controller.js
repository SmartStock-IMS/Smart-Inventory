// const { generateId } = require("../utils/generate-id");
const db = require("../models");
const { quotationSchema } = require("../validators/quotation-validator");
const { customerSchema } = require("../validators/user-validator");

exports.creatQuotation = async (req, res) => {
  try {
    const quotationValidation = quotationSchema.safeParse(req.body);
    if (!quotationValidation.success) {
      return res.status(400).json({
        errors: `Validation failed: ${quotationValidation.error.errors}`,
      });
    }

    const {
      quotation_id,
      quotation_date,
      quotation_due_date,
      subtotal,
      discount,
      selected_items,
      customer_code,
      sales_rep_id,
      payment_term,
      company,
    } = quotationValidation.data;

    const customer = await db.Customer.findOne({
      where: { user_code: customer_code },
    });
    if (!customer) {
      return res.status(400).json({ errors: "Customer not found" });
    }

    // const newQuotationId = generateId();
    const dbTransaction = await db.sequelize.transaction(); // init db-transaction
    try {
      // quotation data
      const quotationData = {
        quotation_id: quotation_id,
        quotation_date: quotation_date,
        quotation_due_date: quotation_due_date,
        customer_id: customer.user_code,
        sales_rep_id: sales_rep_id,
        no_items: selected_items.length,
        sub_total: subtotal,
        discount: discount,
        net_total: subtotal - (subtotal * (discount / 100)),
        payment_term: payment_term,
        company: company,
        status: "Order Process Completed",
      };
      // create quotation-data
      const quotation = await db.Quotation.create(quotationData, {
        transaction: dbTransaction,
      });
      // ensure quotation is not null
      if (!quotation || !quotation.id) {
        return res.status(400).json({ errors: "Quotation creation failed." });
      }

      // create quotation-items-data
      if (selected_items.length > 0) {
        const quotationItems = selected_items.map((item) => ({
          quotation_id: quotation_id,
          item_code: item.code,
          description: item.name,
          item_qty: item.quantity,
          unit_price: item.price,
          total_amount: item.price * item.quantity,
        }));
        await db.QuotationItem.bulkCreate(quotationItems, {
          transaction: dbTransaction,
        });
      }
      await dbTransaction.commit();
      res.status(201).json({
        message: "Quotation added successfully.",
        data: { quotation },
      });
    } catch (error) {
      await dbTransaction.rollback();
      console.error("Error creating quotation: ", error);
      return res.status(500).json({ error: error.message });
    }
  } catch (error) {
    console.log("Error creating quotation (outside): ", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.getQuotationsBySalesRep = async (req, res) => {
  try {
    const salesRepId = req.query.sales_rep_id;
    if (!salesRepId) {
      return res.status(400).json({ errors: "Sales rep id not found" });
    }

    const quotations = await db.Quotation.findAll({
      where: { sales_rep_id: salesRepId },
      include: {
        model: db.QuotationItem,
        as: "quotationItems",
      },
    });
    res.status(200).json(quotations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getQuotationsByCustomer = async (req, res) => {
  try {
    const customerId = req.query.id;
    if (!customerId) {
      return res.status(400).json({ errors: "Sales rep id not found" });
    }

    const quotations = await db.Quotation.findAll({
      where: { customer_id: customerId },
      include: {
        model: db.QuotationItem,
        as: "quotationItems",
      },
    });
    res.status(200).json(quotations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getQuotations = async (req, res) => {
  try {
    const { cursor, limit } = req.query;
    const whereClause = cursor ? { id: { [db.Sequelize.Op.gt]: cursor } } : {};

    const quotations = await db.Quotation.findAll({
      where: whereClause,
      include: {
        model: db.QuotationItem,
        as: "quotationItems",
      },
      order: [["createdAt", "DESC"]],
      limit: limit,
    });

    const nextCursor =
      quotations.length > 0 ? quotations[quotations.length - 1].id : null;
    res.status(200).json({
      data: quotations,
      nextCursor,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const quotationId = req.params.id;

    const invoice = await db.Invoice.findOne({
      where: { quotation_id: quotationId },
      include: {
        model: db.Quotation,
        as: "invoice-quotations",
      },
    });

    res.status(200).json({
      message: "Invoice retrieved successfully.",
      invoice,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateQuotationStatus = async (req, res) => {
  try {
    const quotationId = req.params.id;
    const quotationStatus = req.body.status;
    const paymentTerm = req.body.payment_term;
    const company = req.body.company;
    if (!quotationStatus) {
      return res
        .status(400)
        .json({ errors: "Quotation status value missing." });
    }

    const quotation = await db.Quotation.findOne({
      where: { quotation_id: quotationId },
    });
    if (!quotation) {
      return res.status(404).json({ error: "Quotation record not found." });
    }

    const dbTransaction = await db.sequelize.transaction();
    try {
      await db.Quotation.update(
        { status: quotationStatus, payment_term: paymentTerm, company: company },
        {
          where: { quotation_id: quotationId },
          transaction: dbTransaction,
        },
      );

      await dbTransaction.commit(); // commit transaction
      return res.status(201).json({ message: "Quotation status updated successfully." });
    } catch (error) {
      await dbTransaction.rollback(); // rollback if fails
      console.error("Error updating quotation status: ", error);
      return res.status(500).json({ error: error.message });
    }
  } catch (error) {
    console.log("Unexpected error: ", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.updateQuotationProductQuantity = async (req, res) => {
  try {
    const quotationId = req.params.id;

    const quotation = await db.Quotation.findAll({
      where: { quotation_id: quotationId },
    });
    if (!quotation) {
      return res.status(404).json({ error: "Quotation not found." });
    }

    const quotationItems = await db.QuotationItem.findAll({
      where: { quotation_id: quotationId },
    });
    if (!quotationItems) {
      return res.status(404).json({ error: "Quotation record not found." });
    }

    let updatedItems = [];

    const dbTransaction = await db.sequelize.transaction();
    try {
      // update items quantity
      if (quotationItems.length > 0) {
        for (const item of quotationItems) {
          const itemCode = item.item_code;
          const updatedQty = item.item_qty;

          const variant = await db.Variant.findOne({
            where: { product_code: itemCode },
            transaction: dbTransaction,
          });

          if (!variant) {
            await dbTransaction.rollback();
            return res.status(404).json({ error: "Variant not found" });
          }

          variant.quantity -= updatedQty;
          await variant.save({ transaction: dbTransaction });

          // response data
          updatedItems.push({
            item_code: itemCode,
            quantity: variant.quantity,
          });
        }
      }

      // record invoice
      const result = await db.Invoice.findOne({
        attributes: [
          [db.Sequelize.fn('MAX', db.Sequelize.cast(db.Sequelize.fn('SUBSTRING', db.Sequelize.col('invoice_no'), 4), 'INTEGER')), 'max_invoice']
        ],
      })
      console.log("max invoice: ", result?.get('max_invoice') || 1000);
      console.log("quotation: ", quotation);
      const maxInvoiceNo = result?.get('max_invoice') || 1000;

      const invoiceData = {
        invoice_no: `INV${maxInvoiceNo + 1}`,
        quotation_id: quotationId,
        cr_by: "ACC",
      }

      const invoice = await db.Invoice.create(invoiceData, {
        transaction: dbTransaction,
      });
      // ensure quotation is not null
      if (!invoice || !invoice.id) {
        return res.status(400).json({ errors: "Invoice creation failed." });
      }

      await dbTransaction.commit();
      res.status(201).json({
        message: "Quotation item quantity update successfully.",
        items: updatedItems,
        invoice,
      });
    } catch (error) {
      await dbTransaction.rollback(); // rollback if fails
      console.error("Error updating quotation status: ", error);
      return res.status(500).json({ error: error.message });
    }
  } catch (error) {
    console.error("Error updating product: ", error);
    res.status(500).json({ error: error.message });
  }
}