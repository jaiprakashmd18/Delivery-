"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Phone,
  Package,
  CheckCircle,
  Navigation,
  Clock,
  User,
  ChefHat,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatPrice, formatDate } from "@/lib/utils";

type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

type OrderType = "FOOD" | "PERSONAL_PICKUP" | "GROCERY" | "PARCEL";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string | null;
  menuItem: {
    id: string;
    name: string;
    image?: string | null;
  };
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  createdAt: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  deliveryAddress: string;
  notes?: string | null;
  restaurant?: {
    id: string;
    name: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  customer: {
    id: string;
    name?: string | null;
    phone?: string | null;
  };
  items: OrderItem[];
  // Personal pickup / parcel fields
  pickupRestaurantName?: string | null;
  pickupRestaurantAddress?: string | null;
  receiverName?: string | null;
  receiverPhone?: string | null;
  parcelDescription?: string | null;
  foodDescription?: string | null;
  deliveryLatitude?: number | null;
  deliveryLongitude?: number | null;
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gray-700/50",
        className
      )}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-950 p-4 space-y-4">
      <SkeletonBlock className="h-8 w-48" />
      <SkeletonBlock className="h-32 w-full" />
      <SkeletonBlock className="h-32 w-full" />
      <SkeletonBlock className="h-40 w-full" />
      <SkeletonBlock className="h-14 w-full" />
    </div>
  );
}

const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  FOOD: "Food Order",
  PERSONAL_PICKUP: "Personal Pickup",
  GROCERY: "Grocery",
  PARCEL: "Parcel",
};

const ORDER_TYPE_COLORS: Record<OrderType, string> = {
  FOOD: "bg-[#FF6B00]/20 text-[#FF6B00]",
  PERSONAL_PICKUP: "bg-purple-500/20 text-purple-400",
  GROCERY: "bg-[#00C853]/20 text-[#00C853]",
  PARCEL: "bg-blue-500/20 text-blue-400",
};

interface StatusAction {
  label: string;
  targetStatus: OrderStatus;
  icon: React.ReactNode;
  color: string;
}

function getNextAction(status: OrderStatus): StatusAction | null {
  switch (status) {
    case "ACCEPTED":
    case "PREPARING":
      return {
        label: "Arrived at Restaurant",
        targetStatus: "PICKED_UP",
        icon: <ChefHat className="w-5 h-5" />,
        color: "bg-yellow-500 hover:bg-yellow-400",
      };
    case "PICKED_UP":
      return {
        label: "Order Picked Up – Start Delivery",
        targetStatus: "OUT_FOR_DELIVERY",
        icon: <Navigation className="w-5 h-5" />,
        color: "bg-[#FF6B00] hover:bg-orange-400",
      };
    case "OUT_FOR_DELIVERY":
      return {
        label: "Order Delivered",
        targetStatus: "DELIVERED",
        icon: <CheckCircle className="w-5 h-5" />,
        color: "bg-[#00C853] hover:bg-green-400",
      };
    default:
      return null;
  }
}

function getMapsUrl(address: string, lat?: number | null, lng?: number | null): string {
  if (lat && lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ", Tbilisi, Georgia")}`;
}

export default function ActiveDeliveryPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/delivery/orders/${orderId}`);
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Order not found");
          router.push("/delivery");
          return;
        }
        throw new Error("Failed to fetch order");
      }
      const data = await res.json();
      setOrder(data.data ?? data);
    } catch {
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleStatusUpdate = async (targetStatus: OrderStatus) => {
    if (!order || updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/delivery/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to update status");
      }
      const statusLabels: Record<OrderStatus, string> = {
        PENDING: "Pending",
        ACCEPTED: "Accepted",
        PREPARING: "Preparing",
        PICKED_UP: "Arrived at restaurant",
        OUT_FOR_DELIVERY: "Out for delivery",
        DELIVERED: "Delivered successfully!",
        CANCELLED: "Cancelled",
        REFUNDED: "Refunded",
      };
      toast.success(statusLabels[targetStatus] ?? "Status updated");
      if (targetStatus === "DELIVERED") {
        setTimeout(() => router.push("/delivery/history"), 1500);
      } else {
        setOrder((prev) => prev ? { ...prev, status: targetStatus } : prev);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (!order) return null;

  const nextAction = getNextAction(order.status);
  const pickupName = order.restaurant?.name ?? order.pickupRestaurantName ?? "Pickup Location";
  const pickupAddress = order.restaurant?.address ?? order.pickupRestaurantAddress ?? "";
  const pickupLat = order.restaurant?.latitude;
  const pickupLng = order.restaurant?.longitude;
  const customerName = order.receiverName ?? order.customer.name ?? "Customer";
  const customerPhone = order.receiverPhone ?? order.customer.phone;
  const deliveryEarnings = order.deliveryFee;

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-8">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Active Delivery</p>
            <h1 className="text-xl font-bold text-white">{order.orderNumber}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs font-semibold px-3 py-1.5 rounded-full",
                ORDER_TYPE_COLORS[order.type]
              )}
            >
              {ORDER_TYPE_LABELS[order.type]}
            </span>
          </div>
        </div>
        <div className="max-w-lg mx-auto mt-2 flex items-center gap-1.5 text-gray-400 text-xs">
          <Clock className="w-3.5 h-3.5" />
          <span>Placed {formatDate(order.createdAt, { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* Status indicator */}
        <div className="flex items-center gap-2 bg-gray-900/60 rounded-xl p-3">
          {(["ACCEPTED", "PREPARING"] as OrderStatus[]).includes(order.status) && (
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse shrink-0" />
          )}
          {order.status === "PICKED_UP" && (
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] animate-pulse shrink-0" />
          )}
          {order.status === "OUT_FOR_DELIVERY" && (
            <span className="w-2.5 h-2.5 rounded-full bg-[#00C853] animate-pulse shrink-0" />
          )}
          {order.status === "DELIVERED" && (
            <CheckCircle className="w-4 h-4 text-[#00C853] shrink-0" />
          )}
          <span className="text-sm font-medium text-gray-200">
            {order.status === "ACCEPTED" && "Order accepted – head to restaurant"}
            {order.status === "PREPARING" && "Restaurant is preparing the order"}
            {order.status === "PICKED_UP" && "You've arrived – waiting for order"}
            {order.status === "OUT_FOR_DELIVERY" && "On the way to customer"}
            {order.status === "DELIVERED" && "Order delivered successfully"}
          </span>
        </div>

        {/* Pickup Section */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-[#FF6B00]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Pickup from
            </span>
          </div>
          <div className="p-4">
            <p className="text-base font-bold text-white mb-1">{pickupName}</p>
            <p className="text-sm text-gray-400 mb-3">{pickupAddress}</p>

            {/* Map Placeholder */}
            <div className="relative w-full h-32 bg-gray-800 rounded-xl flex flex-col items-center justify-center gap-2 overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(0deg,transparent_24%,rgba(255,107,0,.3)_25%,rgba(255,107,0,.3)_26%,transparent_27%,transparent_74%,rgba(255,107,0,.3)_75%,rgba(255,107,0,.3)_76%,transparent_77%),linear-gradient(90deg,transparent_24%,rgba(255,107,0,.3)_25%,rgba(255,107,0,.3)_26%,transparent_27%,transparent_74%,rgba(255,107,0,.3)_75%,rgba(255,107,0,.3)_76%,transparent_77%)] bg-[length:40px_40px]" />
              <MapPin className="w-7 h-7 text-[#FF6B00] drop-shadow" />
              <a
                href={getMapsUrl(pickupAddress, pickupLat, pickupLng)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#FF6B00] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-orange-400 transition-colors shadow-lg"
              >
                <Navigation className="w-3.5 h-3.5" />
                Open in Maps
              </a>
            </div>
          </div>
        </div>

        {/* Delivery Section */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <User className="w-4 h-4 text-[#00C853]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Deliver to
            </span>
          </div>
          <div className="p-4">
            <p className="text-base font-bold text-white mb-1">{customerName}</p>
            <div className="flex items-start gap-2 mb-3">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-400">{order.deliveryAddress}</p>
            </div>

            {/* Map Placeholder */}
            <div className="relative w-full h-32 bg-gray-800 rounded-xl flex flex-col items-center justify-center gap-2 overflow-hidden mb-3">
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(0deg,transparent_24%,rgba(0,200,83,.3)_25%,rgba(0,200,83,.3)_26%,transparent_27%,transparent_74%,rgba(0,200,83,.3)_75%,rgba(0,200,83,.3)_76%,transparent_77%),linear-gradient(90deg,transparent_24%,rgba(0,200,83,.3)_25%,rgba(0,200,83,.3)_26%,transparent_27%,transparent_74%,rgba(0,200,83,.3)_75%,rgba(0,200,83,.3)_76%,transparent_77%)] bg-[length:40px_40px]" />
              <MapPin className="w-7 h-7 text-[#00C853] drop-shadow" />
              <a
                href={getMapsUrl(order.deliveryAddress, order.deliveryLatitude, order.deliveryLongitude)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#00C853] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-green-400 transition-colors shadow-lg"
              >
                <Navigation className="w-3.5 h-3.5" />
                Open in Maps
              </a>
            </div>

            {customerPhone && (
              <a
                href={`tel:${customerPhone}`}
                className="flex items-center justify-center gap-2 w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors border border-gray-700"
              >
                <Phone className="w-4 h-4 text-[#00C853]" />
                Call Customer
              </a>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Order Items
            </span>
          </div>
          <div className="divide-y divide-gray-800">
            {order.items.length > 0 ? (
              order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-[#FF6B00]">{item.quantity}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{item.menuItem.name}</p>
                      {item.notes && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.notes}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-300">
                    {formatPrice(item.totalPrice)}
                  </span>
                </div>
              ))
            ) : order.foodDescription ? (
              <div className="px-4 py-3">
                <p className="text-sm text-gray-300">{order.foodDescription}</p>
              </div>
            ) : order.parcelDescription ? (
              <div className="px-4 py-3">
                <p className="text-sm text-gray-300">{order.parcelDescription}</p>
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">No items listed</div>
            )}
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-gray-900 rounded-2xl border border-yellow-800/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
              <span className="text-yellow-400 text-xs">📝</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-yellow-400/80">
                Customer Notes
              </span>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-gray-300 italic">{order.notes}</p>
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Payment Summary
            </span>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-[#00C853]">
                <span>Discount</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            {order.tax > 0 && (
              <div className="flex justify-between text-sm text-gray-400">
                <span>Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-400 border-t border-gray-800 pt-2">
              <span>Delivery Fee</span>
              <span>{formatPrice(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white border-t border-gray-800 pt-2">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
            <div className="flex items-center justify-between mt-3 bg-[#00C853]/10 border border-[#00C853]/20 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#00C853]" />
                <span className="text-sm font-medium text-[#00C853]">Your Earnings</span>
              </div>
              <span className="text-lg font-bold text-[#00C853]">
                {formatPrice(deliveryEarnings)}
              </span>
            </div>
          </div>
        </div>

        {/* Status Action Button */}
        {nextAction && (
          <button
            onClick={() => handleStatusUpdate(nextAction.targetStatus)}
            disabled={updating}
            className={cn(
              "w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-bold text-base transition-all shadow-lg active:scale-95",
              nextAction.color,
              updating && "opacity-60 cursor-not-allowed"
            )}
          >
            {updating ? (
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              nextAction.icon
            )}
            <span>{updating ? "Updating..." : nextAction.label}</span>
            {!updating && <ArrowRight className="w-4 h-4" />}
          </button>
        )}

        {order.status === "DELIVERED" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle className="w-12 h-12 text-[#00C853]" />
            <p className="text-lg font-bold text-white">Delivery Complete!</p>
            <p className="text-sm text-gray-400">Great job! Your earnings have been recorded.</p>
            <button
              onClick={() => router.push("/delivery")}
              className="mt-2 bg-[#FF6B00] hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
