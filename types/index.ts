import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

// ─── User Roles ───────────────────────────────────────────────────────────────

export type UserRole =
  | "CUSTOMER"
  | "RESTAURANT_OWNER"
  | "DELIVERY_PARTNER"
  | "ADMIN";

// ─── Filter Types ─────────────────────────────────────────────────────────────

export type CuisineCategory =
  | "All"
  | "Indian"
  | "Chinese"
  | "Georgian"
  | "Fast Food"
  | "Desserts"
  | "Beverages";

export type SortOption =
  | "relevance"
  | "rating"
  | "delivery_time"
  | "price_low"
  | "price_high";

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  restaurantId: string;
  restaurantName: string;
  specialInstructions?: string;
}

// ─── Auth / User ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
  phone?: string | null;
  referralCode?: string | null;
  balance?: number;
}

export interface Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: UserRole;
    phone?: string | null;
    referralCode?: string | null;
    balance?: number;
  };
  expires: string;
}

// ─── MenuItem ────────────────────────────────────────────────────────────────

export interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  categoryId?: string | null;
  restaurantId: string;
  isAvailable: boolean;
  isVeg: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  calories?: number | null;
  allergens: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type MenuItemType = MenuItem;

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  restaurantId: string;
  sortOrder: number;
  isActive: boolean;
  menuItems: MenuItem[];
}

// ─── Review ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  userId: string;
  restaurantId?: string | null;
  orderId?: string | null;
  rating: number;
  comment?: string | null;
  images: string[];
  deliveryRating?: number | null;
  deliveryComment?: string | null;
  isVerified: boolean;
  isAnonymous?: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    name?: string | null;
    image?: string | null;
  };
  // Legacy compat
  restaurantRating?: number | null;
  customerId?: string;
  customer?: {
    name?: string | null;
    image?: string | null;
  };
}

// ─── Restaurant ──────────────────────────────────────────────────────────────

export type RestaurantDetail = RestaurantWithDetails;

export interface RestaurantWithDetails {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  coverImage?: string | null;
  address: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  isActive: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  deliveryFee: number;
  minOrderAmount: number;
  deliveryRadius: number;
  avgDeliveryTime: number;
  rating: number;
  totalRatings: number;
  cuisineType?: string[];
  openingHours?: Record<
    string,
    { open: string; close: string; isClosed: boolean }
  > | null;
  categories: Category[];
  menuItems: MenuItem[];
  reviews: Review[];
  averageRating: number;
  isOpen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type OrderType = "FOOD" | "PERSONAL_PICKUP" | "GROCERY" | "PARCEL";

export type PaymentMethod =
  | "CASH_ON_DELIVERY"
  | "CARD"
  | "BANK_TRANSFER"
  | "WALLET";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface OrderItemDetail {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string | null;
  menuItem: Pick<MenuItem, "id" | "name" | "image" | "price">;
}

export interface OrderDriver {
  id: string;
  name?: string | null;
  phone?: string | null;
  image?: string | null;
}

export interface OrderCustomer {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  image?: string | null;
}

export interface OrderWithDetails {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  type: OrderType;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryAddress?: string | null;
  notes?: string | null;
  scheduledFor?: Date | null;
  estimatedDelivery?: Date | null;
  deliveredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  restaurant: Pick<
    RestaurantWithDetails,
    "id" | "name" | "image" | "phone" | "address"
  >;
  items: OrderItemDetail[];
  driver?: OrderDriver | null;
  customer: OrderCustomer;
}

// ─── Place Order Input ────────────────────────────────────────────────────────

export interface PlaceOrderInput {
  restaurantId?: string;
  type?: OrderType;
  items: Array<{
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }>;
  deliveryAddressId: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  deliveryInstructions?: string;
}

// ─── Delivery Address ────────────────────────────────────────────────────────

export interface DeliveryAddress {
  id: string;
  userId: string;
  street: string;
  apartment?: string | null;
  city: string;
  lat?: number | null;
  lng?: number | null;
  isDefault: boolean;
  label: string;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export type NotificationType =
  | "ORDER_UPDATE"
  | "PROMOTION"
  | "SYSTEM"
  | "PAYMENT"
  | "DELIVERY";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown> | null;
  createdAt: Date;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── NextAuth Module Augmentation ─────────────────────────────────────────────

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      phone?: string | null;
      referralCode?: string | null;
      balance?: number;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: UserRole;
    phone?: string | null;
    referralCode?: string | null;
    balance?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: UserRole;
    phone?: string | null;
    referralCode?: string | null;
    balance?: number;
  }
}
