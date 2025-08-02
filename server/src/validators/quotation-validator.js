const { z } = require("zod");

const quotationSchema = z.object({
  customer_code: z.string(),
  sales_rep_id: z.string(),
  quotation_id: z.string(),
  quotation_date: z.string().date(),
  quotation_due_date: z.string().date(),
  subtotal: z.number(),
  discount: z.number(),
  selected_items: z.array(
    z.object({
      id: z.number(),
      code: z.string(),
      category: z.string(),
      color: z.string(),
      name: z.string(),
      price: z.string(),
      quantity: z.number(),
      url: z.string(),
    }),
  ),
  payment_term: z.string(),
  company: z.string(),
});

module.exports = { quotationSchema };
