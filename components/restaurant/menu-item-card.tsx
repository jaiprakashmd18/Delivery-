"use client";

import React from "react";
import Image from "next/image";
import { Plus, Minus, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { MenuItemType } from "@/types";

interface Props {
  item: MenuItemType;
  restaurantId: string;
  restaurantName: string;
}

export function MenuItemCard({ item, restaurantId, restaurantName }: Props) {
  const { items, addItem, removeItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.menuItemId === item.id);
  const qty = cartItem?.quantity ?? 0;

  const cartItemId = `${restaurantId}-${item.id}`;

  const handleAdd = () => {
    addItem({
      id: cartItemId,
      menuItemId: item.id,
      restaurantId,
      restaurantName,
      name: item.name,
      image: item.image ?? undefined,
      price: item.price,
      quantity: 1,
    });
  };

  const handleDecrement = () => {
    if (qty <= 1) removeItem(cartItemId);
    else updateQuantity(cartItemId, qty - 1);
  };

  return (
    <div className={`flex gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors ${!item.isAvailable ? "opacity-50" : ""}`}>
      {/* Image */}
      <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-muted">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
        )}
        {item.isPopular && (
          <div className="absolute top-1 left-1">
            <Badge className="text-[9px] py-0 px-1 bg-primary text-white border-0">Popular</Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              {item.isVeg ? (
                <span className="w-4 h-4 border-2 border-accent rounded flex items-center justify-center shrink-0">
                  <span className="w-2 h-2 bg-accent rounded-full" />
                </span>
              ) : (
                <span className="w-4 h-4 border-2 border-red-500 rounded flex items-center justify-center shrink-0">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                </span>
              )}
              <h3 className="font-semibold text-sm truncate">{item.name}</h3>
            </div>
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
            )}
            {item.calories && (
              <p className="text-xs text-muted-foreground mt-1">{item.calories} kcal</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-primary">{formatPrice(item.price)}</span>

          {!item.isAvailable ? (
            <Badge variant="outline" className="text-xs">Unavailable</Badge>
          ) : qty === 0 ? (
            <Button
              size="sm"
              onClick={handleAdd}
              className="h-8 bg-primary hover:bg-primary/90 text-white gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7 rounded-full border-primary text-primary hover:bg-primary hover:text-white"
                onClick={handleDecrement}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="font-bold text-sm w-4 text-center">{qty}</span>
              <Button
                size="icon"
                className="h-7 w-7 rounded-full bg-primary hover:bg-primary/90 text-white"
                onClick={handleAdd}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
