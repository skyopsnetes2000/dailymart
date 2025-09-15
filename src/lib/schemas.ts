
import { z } from 'zod';

export const AddressSchema = z.object({
  line1: z.string().min(1, 'Address is required.'),
  landmark: z.string().optional(),
  city: z.string().min(1, 'City is required.'),
  state: z.string().min(1, 'State is required.'),
  zip: z.string().min(1, 'ZIP code is required.'),
  mobile: z.string().min(10, 'A valid mobile number is required.'),
  isDefault: z.boolean().default(false),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  weight: z.string().min(1, 'Weight is required'),
  categorySlug: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional(),
  dietaryType: z.enum(['veg', 'non-veg', 'egg']).optional(),
  images: z.any(),
});
