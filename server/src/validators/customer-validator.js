const { z } = require("zod");

const customerSchema = z.object({
  user_code: z.string().min(1, "User code is required."),
  first_name: z.string().min(1, "First name is required."),
  last_name: z.string().min(1, "Last name is required."),
  email: z.string().min(1, "Email is required."),
  contact1: z.string().min(1, "Contact mobile is required."),
  contact2: z.string().optional(),
  address_line1: z.string().min(1, "Address Line 1 is required."),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  district: z.string().min(1, "District is required"),
  province: z.string().min(1, "Province is required"),
  postal_code: z.string().min(1, "Postal code is required"),
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

module.exports = {
  customerSchema,
  customerUpdateSchema,
};
