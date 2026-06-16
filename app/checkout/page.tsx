"use client";
export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CreditCard, Banknote, Wallet, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

const PAYMENT_METHODS = [
  { id: "CASH_ON_DELIVERY", label: "Cash on Delivery", icon: Banknote, desc: "Pay when your order arrives" },
  { id: "CARD", label: "Card Payment", icon: CreditCard, desc: "Visa, Mastercard accepted" },
  { id: "WALLET", label: "Wallet Balance", icon: Wallet, desc: "Use your StudentExpress wallet" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, couponDiscount, clearCart } = useCartStore();
  const subtotal = getSubtotal;
  const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);

  const deliveryFee = 3.0;
  const tax = subtotal() * 0.05;
  const total = subtotal() + deliveryFee + tax - couponDiscount;

  const handlePlaceOrder = async () => {
    if (!deliveryAddress) {
      toast.error("Please enter a delivery address");
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
          restaurantId: items[0]?.restaurantId,
          deliveryAddress,
          notes,
          paymentMethod,
          subtotal: subtotal(),
          deliveryFee,
          tax,
          discount: couponDiscount,
          total,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        clearCart();
        const orderNumber = data.data?.orderNumber ?? data.orderNumber;
        router.push(`/checkout/success?order=${orderNumber}`);
      } else {
        toast.error(data.error || "Failed to place order. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    router.replace("/cart");
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-2xl font-bold mb-8">Checkout</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Delivery & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Delivery Address
                </h2>
                <Textarea
                  placeholder="Enter your full delivery address (street, building, apartment, landmark)..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="mb-3 min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Include landmarks to help the delivery partner find you faster
                </p>
              </div>

              {/* Special Instructions */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-bold text-lg mb-4">Delivery Instructions</h2>
                <Textarea
                  placeholder="Any special instructions for the restaurant or delivery partner? (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {/* Payment Method */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" /> Payment Method
                </h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map(({ id, label, icon: Icon, desc }) => (
                    <label
                      key={id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        paymentMethod === id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={id}
                        checked={paymentMethod === id}
                        onChange={() => setPaymentMethod(id)}
                        className="sr-only"
                      />
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === id ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                      {paymentMethod === id && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border overflow-hidden sticky top-24">
                <div className="p-4 border-b border-border">
                  <h2 className="font-bold">Order Summary</h2>
                  <p className="text-xs text-muted-foreground">{items[0]?.restaurantName}</p>
                </div>
                <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.menuItemId} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate flex-1 mr-2">
                        {item.quantity}× {item.name}
                      </span>
                      <span className="shrink-0">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal())}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{formatPrice(deliveryFee)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatPrice(tax)}</span></div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-accent"><span>Discount</span><span>-{formatPrice(couponDiscount)}</span></div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-white h-12 font-semibold"
                    onClick={handlePlaceOrder}
                    disabled={placing}
                  >
                    {placing ? "Placing Order..." : `Place Order • ${formatPrice(total)}`}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    By placing this order, you agree to our Terms of Service
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
