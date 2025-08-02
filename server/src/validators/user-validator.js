const { z } = require("zod");

const userSchema = z.object({
  emp_code: z.string().min(1, "Employee Code required."),
  user_type_id: z.string(),
  username: z.string().min(1, "Username required."),
  password: z.string().min(1, "Password required."),
  name: z.string().min(1, "Name required."),
  address: z.string().min(1, "Address required."),
  email: z.string().min(1, "Email required."),
  dob: z.date(),
  contact: z.number().min(1, "Contact Required."),
});

const userUpdateSchema = z.object({
  emp_code: z.string().min(1, "Employee Code required.").optional(),
  user_type_id: z.string().optional(),
  username: z.string().min(1, "Username required.").optional(),
  password: z.string().min(1, "Password required.").optional(),
  name: z.string().min(1, "Name required.").optional(),
  address: z.string().min(1, "Address required.").optional(),
  email: z.string().min(1, "Email required.").optional(),
  dob: z.date().optional(),
  contact: z.number().min(1, "Contact Required.").optional(),
});

const customerSchema = z.object({
  user_code: z.string().min(1, "Product code required."),
  first_name: z.string().min(1, "Product name required."),
  last_name: z.string().min(1, "Product name required."),
  email: z.string().min(1, "Product email required."),
  contact1: z.string().min(1, "Product contact1 required."),
  contact2: z.string().optional(),
  address_line1: z.string().min(1, "Product address line1 required."),
  address_line2: z.string().optional(),
  city: z.string().min(1, "Product city required."),
  district: z.string().min(1, "Product district required."),
  province: z.string().min(1, "Product province required."),
  postal_code: z.string().min(1, "Product postal required."),
  note: z.string().optional(),
});

const customerUpdateSchema = z.object({
  user_code: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  contact1: z.string().optional(),
  contact2: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  postal_code: z.string().optional(),
  note: z.string().optional(),
});


const salesRepSchema = z.object({
  user_code: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  contact: z.string(),
  address: z.string(),
  city: z.string(),
  province: z.string(),
  postal_code: z.string(),
  sales_area: z.string(),
  customer_count: z.number().optional(),
  status: z.string(),
});

const salesRepUpdateSchema = z.object({
  name: z.string().min(1, "Name should contain lease 1 character.").optional(),
  email: z.string().email().optional(),
  phone: z.number().optional(),
  address: z.string().min(1, "Address should contain at least 1 character").optional(),
  region: z.string().min(1, "Sales Region should contain at least 1 character").optional(),
  status: z.string().min(1, "Status should contain at least 1 character").optional(),
});

module.exports = {
  userSchema,
  userUpdateSchema,
  customerSchema,
  customerUpdateSchema,
  salesRepSchema,
  salesRepUpdateSchema,
};
