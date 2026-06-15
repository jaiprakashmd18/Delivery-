import { z } from "zod";

const dayScheduleSchema = z.object({
  open: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Opening time must be in HH:MM format"),
  close: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Closing time must be in HH:MM format"),
  isOpen: z.boolean(),
});

export const restaurantSchema = z.object({
  name: z
    .string()
    .min(2, "Restaurant name must be at least 2 characters")
    .max(100, "Restaurant name must be at most 100 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    lat: z.number({ required_error: "Latitude is required" }),
    lng: z.number({ required_error: "Longitude is required" }),
  }),
  phone: z
    .string()
    .regex(
      /^(\+995|0)(5\d{8}|[23]\d{7})$/,
      "Please enter a valid Georgian phone number"
    ),
  email: z.string().email("Please enter a valid email address").optional(),
  cuisineType: z
    .array(z.string().min(1, "Cuisine type cannot be empty"))
    .min(1, "At least one cuisine type is required"),
  openingHours: z.object({
    mon: dayScheduleSchema,
    tue: dayScheduleSchema,
    wed: dayScheduleSchema,
    thu: dayScheduleSchema,
    fri: dayScheduleSchema,
    sat: dayScheduleSchema,
    sun: dayScheduleSchema,
  }),
  deliveryFee: z
    .number()
    .nonnegative("Delivery fee cannot be negative"),
  minimumOrder: z
    .number()
    .nonnegative("Minimum order cannot be negative"),
  estimatedDeliveryTime: z
    .number()
    .int("Estimated delivery time must be a whole number")
    .positive("Estimated delivery time must be positive"),
  isActive: z.boolean().default(true),
});

export const menuItemSchema = z.object({
  name: z
    .string()
    .min(2, "Item name must be at least 2 characters")
    .max(100, "Item name must be at most 100 characters"),
  description: z
    .string()
    .max(300, "Description must be at most 300 characters")
    .optional(),
  price: z.number().positive("Price must be greater than zero"),
  categoryId: z.string().min(1, "Category is required"),
  images: z
    .array(z.string().url("Each image must be a valid URL"))
    .optional(),
  isAvailable: z.boolean().default(true),
  allergens: z
    .array(z.string().min(1, "Allergen cannot be empty"))
    .optional(),
  nutritionInfo: z
    .object({
      calories: z.number().nonnegative("Calories cannot be negative"),
      protein: z.number().nonnegative("Protein cannot be negative"),
      carbs: z.number().nonnegative("Carbs cannot be negative"),
      fat: z.number().nonnegative("Fat cannot be negative"),
    })
    .optional(),
});

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name must be at most 50 characters"),
  restaurantId: z.string().min(1, "Restaurant ID is required"),
  sortOrder: z
    .number()
    .int("Sort order must be a whole number")
    .default(0),
});

export type RestaurantInput = z.infer<typeof restaurantSchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
