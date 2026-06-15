import { z } from "zod";

const coordinatesSchema = z.object({
  lat: z.number({ required_error: "Latitude is required" }),
  lng: z.number({ required_error: "Longitude is required" }),
});

const deliveryAddressSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  lat: z.number({ required_error: "Latitude is required" }),
  lng: z.number({ required_error: "Longitude is required" }),
});

const paymentMethodEnum = z.enum(["cash", "card", "balance"], {
  errorMap: () => ({ message: "Payment method must be cash, card, or balance" }),
});

export const orderItemSchema = z.object({
  restaurantId: z.string().min(1, "Restaurant ID is required"),
  menuItemId: z.string().min(1, "Menu item ID is required"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),
  specialInstructions: z.string().optional(),
});

export const orderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, "Order must contain at least one item"),
  deliveryAddress: deliveryAddressSchema,
  paymentMethod: paymentMethodEnum,
  note: z.string().optional(),
});

export const personalPickupSchema = z.object({
  pickupAddress: z.object({
    street: z.string().min(1, "Pickup street address is required"),
    city: z.string().min(1, "Pickup city is required"),
    lat: z.number({ required_error: "Pickup latitude is required" }),
    lng: z.number({ required_error: "Pickup longitude is required" }),
  }),
  deliveryAddress: z.object({
    street: z.string().min(1, "Delivery street address is required"),
    city: z.string().min(1, "Delivery city is required"),
    lat: z.number({ required_error: "Delivery latitude is required" }),
    lng: z.number({ required_error: "Delivery longitude is required" }),
  }),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description must be at most 1000 characters"),
  estimatedWeight: z
    .number()
    .positive("Weight must be a positive number")
    .optional(),
  paymentMethod: paymentMethodEnum,
});

export const groceryOrderSchema = z.object({
  storeId: z.string().optional(),
  items: z
    .array(
      z.object({
        name: z.string().min(1, "Item name is required"),
        quantity: z
          .number()
          .positive("Quantity must be positive")
          .min(0.01, "Quantity must be at least 0.01"),
        unit: z.string().min(1, "Unit is required"),
        notes: z
          .string()
          .max(200, "Notes must be at most 200 characters")
          .optional(),
      })
    )
    .min(1, "Grocery list must contain at least one item"),
  deliveryAddress: deliveryAddressSchema,
  budget: z.number().positive("Budget must be a positive number").optional(),
  paymentMethod: paymentMethodEnum,
});

export const parcelOrderSchema = z.object({
  senderAddress: z.object({
    street: z.string().min(1, "Sender street address is required"),
    city: z.string().min(1, "Sender city is required"),
    lat: z.number({ required_error: "Sender latitude is required" }),
    lng: z.number({ required_error: "Sender longitude is required" }),
  }),
  recipientAddress: z.object({
    street: z.string().min(1, "Recipient street address is required"),
    city: z.string().min(1, "Recipient city is required"),
    lat: z.number({ required_error: "Recipient latitude is required" }),
    lng: z.number({ required_error: "Recipient longitude is required" }),
  }),
  recipientName: z
    .string()
    .min(2, "Recipient name must be at least 2 characters")
    .max(100, "Recipient name must be at most 100 characters"),
  recipientPhone: z
    .string()
    .regex(
      /^(\+995|0)(5\d{8}|[23]\d{7})$/,
      "Please enter a valid Georgian phone number"
    ),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description must be at most 1000 characters"),
  weight: z.number().positive("Weight must be a positive number").optional(),
  isFragile: z.boolean().default(false),
  paymentMethod: paymentMethodEnum,
});

export const checkoutSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  paymentMethod: paymentMethodEnum,
  promoCode: z.string().optional(),
});

// Re-export coordinate schema for use in other modules
export { coordinatesSchema };

export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type PersonalPickupInput = z.infer<typeof personalPickupSchema>;
export type GroceryOrderInput = z.infer<typeof groceryOrderSchema>;
export type ParcelOrderInput = z.infer<typeof parcelOrderSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
