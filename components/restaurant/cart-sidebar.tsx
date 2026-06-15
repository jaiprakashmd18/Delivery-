"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

export function CartSidebar() {
  const { items, removeItem, updateQuantity, getSubtotal, couponDiscount } = useCartStore();

  const deliveryFee = 3.0;
  const tax = getSubtotal() * 0.05;

  if (items.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 text-center">
        <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <h3 className="font-semibold mb-1">Your cart is empty</h3>
        <p className="text-sm text-muted-foreground">Add items from the menu to start your order</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-bold text-lg">Your Order</h3>
        <p className="text-xs text-muted-foreground">{items[0]?.restaurantName}</p>
      </div>

      <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <span className="flex-1 text-sm truncate">{item.name}</span>
            <span className="text-sm font-semibold shrink-0">{formatPrice(item.price * item.quantity)}</span>
            <button
              onClick={() => removeItem(item.id)}
              className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <Separator />

      <div className="p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(getSubtotal())}</span>
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
          <div className="flex justify-between text-accent">
            <span>Coupon Discount</span>
            <span>-{formatPrice(couponDiscount)}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between font-bold text-base">
          <span>Total</span>
          <span className="text-primary">{formatPrice(getSubtotal() + deliveryFee + tax - couponDiscount)}</span>
        </div>
      </div>

      <div className="p-4 pt-0">
        <Link href="/checkout">
          <Button className="w-full bg-primary hover:bg-primary/90 text-white h-12 font-semibold">
            Proceed to Checkout
          </Button>
        </Link>
      </div>
    </div>
  );
}
