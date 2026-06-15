"use client";

import React, { useState } from "react";
import { Plus, Trash2, ShoppingCart, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

interface GroceryItem { name: string; quantity: number; unit: string; notes: string; }

const STORES = [
  { id: "carrefour", name: "Carrefour", icon: "🛒" },
  { id: "goodwill", name: "Goodwill", icon: "🏪" },
  { id: "nikora", name: "Nikora", icon: "🛍️" },
  { id: "fresco", name: "Fresco", icon: "🥬" },
];

export default function GroceryPage() {
  const [selectedStore, setSelectedStore] = useState("");
  const [items, setItems] = useState<GroceryItem[]>([{ name: "", quantity: 1, unit: "piece", notes: "" }]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [extraNotes, setExtraNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const addItem = () => setItems([...items, { name: "", quantity: 1, unit: "piece", notes: "" }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof GroceryItem, value: string | number) =>
    setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const handleSubmit = async () => {
    const validItems = items.filter((i) => i.name.trim());
    if (!selectedStore) { toast.error("Please select a store"); return; }
    if (validItems.length === 0) { toast.error("Add at least one item"); return; }
    if (!deliveryAddress) { toast.error("Enter your delivery address"); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/grocery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: selectedStore, items: validItems, deliveryAddress, deliveryTime, notes: extraNotes }),
      });
      const data = await res.json();
      if (res.ok) { setResult(data); toast.success("Grocery order submitted!"); }
      else { toast.error(data.error || "Failed to submit"); }
    } catch { toast.error("Something went wrong"); }
    finally { setSubmitting(false); }
  };

  if (result) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-md text-center">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-accent" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Grocery Order Placed!</h1>
            <p className="text-muted-foreground mb-6">We&apos;ll shop for your items and deliver them to you.</p>
            <div className="bg-card rounded-2xl border border-border p-5 text-left space-y-3 mb-6">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Order #</span><span className="font-mono font-bold text-primary">{result.orderNumber}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Est. Delivery Fee</span><span className="font-semibold">{formatPrice(result.estimatedFee ?? 4)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Est. Time</span><span className="font-semibold">{result.estimatedTime ?? "60-90"} min</span></div>
            </div>
            <Button onClick={() => setResult(null)} variant="outline" className="w-full">New Order</Button>
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
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-2 text-sm font-medium mb-4">
              <ShoppingCart className="w-4 h-4" /> Grocery Delivery
            </div>
            <h1 className="text-3xl font-bold mb-3">Fresh Groceries Delivered</h1>
            <p className="text-muted-foreground">Tell us what you need and we&apos;ll shop for you.</p>
          </div>

          <div className="space-y-6">
            {/* Store Selection */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="font-bold text-lg mb-4">Choose a Store</h2>
              <div className="grid grid-cols-2 gap-3">
                {STORES.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => setSelectedStore(store.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors text-left ${selectedStore === store.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                  >
                    <span className="text-2xl">{store.icon}</span>
                    <span className="font-medium">{store.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Items List */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Grocery List</h2>
                <Button size="sm" variant="outline" onClick={addItem} className="gap-1">
                  <Plus className="w-4 h-4" /> Add Item
                </Button>
              </div>
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-start">
                    <Input
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => updateItem(i, "name", e.target.value)}
                      className="col-span-5"
                    />
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)}
                      className="col-span-2"
                    />
                    <Select value={item.unit} onValueChange={(v) => updateItem(i, "unit", v)}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="piece">piece</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="liter">liter</SelectItem>
                        <SelectItem value="pack">pack</SelectItem>
                      </SelectContent>
                    </Select>
                    <button onClick={() => removeItem(i)} className="col-span-2 flex items-center justify-center h-10 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <h2 className="font-bold text-lg">Delivery Details</h2>
              <div>
                <Label>Delivery Address *</Label>
                <Textarea
                  placeholder="Your full delivery address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="mt-1 min-h-[70px]"
                />
              </div>
              <div>
                <Label>Preferred Delivery Time (optional)</Label>
                <Input
                  type="datetime-local"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Additional Notes (optional)</Label>
                <Textarea
                  placeholder="Brand preferences, substitutions allowed, etc."
                  value={extraNotes}
                  onChange={(e) => setExtraNotes(e.target.value)}
                  className="mt-1 min-h-[60px]"
                />
              </div>
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white h-12 font-semibold"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Grocery Order"}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
