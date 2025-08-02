const { z } = require("zod");

const productSchema = z.object({
  name: z.string().min(1, "Product name required."),
  category: z.string().min(1, "Category required."),
  main_image: z.string().min(1, "Product image required."),
  no_variants: z.number(),
  variants: z.array(
    z.object({
      product_code: z.string().min(1, "Product code required."),
      color: z.string().min(1, "Product color required."),
      price: z.number(),
      image: z.string().min(1, "Product image required."),
      quantity: z.number(),
      min_qty: z.number(),
      mfd_date: z.string().date(),
      exp_date: z.string().date(),
    }),
  ),
});

const productUpdateSchema = z.object({
  name: z.string().min(1, "Product name required.").optional(),
  category: z.string().optional(),
  main_image: z.string().optional(),
  no_variants: z.number().optional(),
  variants: z
    .array(
      z.object({
        product_code: z.string().min(1, "Product code required.").optional(),
        color: z.string().optional(),
        price: z.number().optional(),
        image: z.string().optional(),
        quantity: z.number().optional(),
        min_qty: z.number().optional(),
        mfd_date: z.string().date().optional(),
        exp_date: z.string().date().optional(),
      }),
    )
    .optional(),
});

module.exports = { productSchema, productUpdateSchema };
