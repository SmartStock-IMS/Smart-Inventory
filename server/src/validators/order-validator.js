const { z } = require("zod");

const orderSchema = z.object({
  subtotal: z.number(),
  discount: z.number(),
  selected_items: z.array(z.any()),
  customer_code: z.string().min(1, "customer_code required."),
});
