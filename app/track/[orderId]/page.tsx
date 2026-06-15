"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect, use } from "react";
import { CheckCircle, Circle, Clock, MapPin, Phone, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { formatPrice } from "@/lib/utils";

const STATUS_STAGES = [
  { key: "PENDING", label: "Order Received", desc: "Your order has been placed" },
  { key: "ACCEPTED", label: "Order Accepted", desc: "Restaurant confirmed your order" },
  { key: "PREPARING", label: "Preparing", desc: "Your food is being prepared" },
  { key: "PICKED_UP", label: "Picked Up", desc: "Delivery partner has your order" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", desc: "On the way to you" },
  { key: "DELIVERED", label: "Delivered", desc: "Order delivered successfully!" },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  ACCEPTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PREPARING: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  PICKED_UP: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  OUT_FOR_DELIVERY: "bg-primary/10 text-primary",
  DELIVERED: "bg-accent/10 text-accent",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function TrackOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  const currentStageIndex = order
    ? STATUS_STAGES.findIndex((s) => s.key === order.status)
    : -1;

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading order...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Order not found</h2>
            <p className="text-muted-foreground">Check your order number and try again.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Track Order</h1>
              <p className="text-muted-foreground font-mono text-sm">{order.orderNumber}</p>
            </div>
            <Badge className={STATUS_COLORS[order.status] ?? "bg-muted text-foreground"}>
              {order.status.replace(/_/g, " ")}
            </Badge>
          </div>

          {/* Status Timeline */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <h2 className="font-semibold mb-6">Order Status</h2>
            <div className="space-y-0">
              {STATUS_STAGES.map((stage, i) => {
                const isDone = i <= currentStageIndex;
                const isCurrent = i === currentStageIndex;
                return (
                  <div key={stage.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                        isDone
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}>
                        {isDone ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      </div>
                      {i < STATUS_STAGES.length - 1 && (
                        <div className={`w-0.5 h-8 mt-1 transition-all duration-500 ${isDone && i < currentStageIndex ? "bg-primary" : "bg-border"}`} />
                      )}
                    </div>
                    <div className="pb-8">
                      <p className={`font-medium ${isDone ? "text-foreground" : "text-muted-foreground"}`}>
                        {stage.label}
                        {isCurrent && <span className="ml-2 text-xs text-primary animate-pulse">● Live</span>}
                      </p>
                      <p className="text-sm text-muted-foreground">{stage.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Delivery Info */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Delivery Address
              </h3>
              <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
              {order.estimatedDeliveryTime && (
                <div className="flex items-center gap-2 mt-3 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Est. {order.estimatedDeliveryTime} min</span>
                </div>
              )}
            </div>

            {/* Delivery Partner */}
            {order.deliveryPartner && (
              <div className="bg-card rounded-2xl border border-border p-5">
                <h3 className="font-semibold mb-3">Delivery Partner</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    {order.deliveryPartner.user?.name?.[0] ?? "D"}
                  </div>
                  <div>
                    <p className="font-medium">{order.deliveryPartner.user?.name ?? "Partner"}</p>
                    <p className="text-xs text-muted-foreground">{order.deliveryPartner.vehicleType}</p>
                  </div>
                  {order.deliveryPartner.user?.phone && (
                    <a
                      href={`tel:${order.deliveryPartner.user.phone}`}
                      className="ml-auto w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="mt-4 bg-card rounded-2xl border border-border p-5">
            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="space-y-2">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.quantity}× {item.menuItem?.name ?? "Item"}</span>
                  <span>{formatPrice(item.totalPrice)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
