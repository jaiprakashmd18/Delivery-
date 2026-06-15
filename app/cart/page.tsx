"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Trash2, Plus, Minus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getSubtotal, couponCode, couponDiscount, applyCoupon, removeCoupon } = useCartStore();
  const [couponInput, setCouponInput] = useState("");
  const [validating, setValidating] = useState(false);
  const subtotal = getSubtotal;

  const deliveryFee = items.length > 0 ? 3.0 : 0;
  const tax = subtotal() * 0.05;
  const total = subtotal() + deliveryFee + tax - couponDiscount;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setValidating(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, orderAmount: subtotal() }),
      });
      const data = await res.json();
      if (res.ok) {
        applyCoupon(data.code, data.discountAmount);
        toast.success(`Coupon applied! You saved ${formatPrice(data.discountAmount)}`);
        setCouponInput("");
      } else {
        toast.error(data.error || "Invalid coupon code");
      }
    } finally {
      setValidating(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <ShoppingCart className="w-24 h-24 text-muted-foreground/20 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-3">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">Add some delicious food to get started!</p>
            <Link href="/restaurants">
              <Button className="bg-primary hover:bg-primary/90 text-white px-8 h-12">
                Browse Restaurants
              </Button>
            </Link>
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
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/restaurants" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold">Your Cart</h1>
            <span className="text-muted-foreground text-sm">({items.length} item{items.length !== 1 ? "s" : ""})</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">{items[0].restaurantName}</h2>
                    <p className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive text-xs">
                    Clear Cart
                  </Button>
                </div>

                <div className="divide-y divide-border">
                  {items.map((item) => (
                    <div key={item.menuItemId} className="p-4 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : "🍽️"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.name}</h3>
                        <p className="text-primary font-semibold">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => item.quantity <= 1 ? removeItem(item.id) : updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-sm w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors mt-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupon */}
              <div className="bg-card rounded-2xl border border-border p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" /> Coupon Code
                </h3>
                {couponCode ? (
                  <div className="flex items-center justify-between bg-accent/10 rounded-xl px-4 py-3">
                    <div>
                      <p className="font-medium text-accent">{couponCode}</p>
                      <p className="text-sm text-muted-foreground">-{formatPrice(couponDiscount)} saved</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removeCoupon} className="text-destructive">
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="font-mono"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={!couponInput || validating}
                      className="bg-primary hover:bg-primary/90 text-white shrink-0"
                    >
                      {validating ? "..." : "Apply"}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border overflow-hidden sticky top-24">
                <div className="p-4 border-b border-border">
                  <h2 className="font-bold text-lg">Order Summary</h2>
                </div>
                <div className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (5%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-accent font-medium">
                      <span>Coupon Discount</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <Link href="/checkout">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white h-12 font-semibold">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <Link href="/restaurants">
                    <Button variant="ghost" className="w-full mt-2 text-sm">
                      Continue Shopping
                    </Button>
                  </Link>
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
