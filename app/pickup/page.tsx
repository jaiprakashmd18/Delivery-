"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Upload, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

const schema = z.object({
  restaurantName: z.string().min(2, "Restaurant name required"),
  restaurantAddress: z.string().min(5, "Restaurant address required"),
  foodDescription: z.string().min(10, "Please describe what you want to order"),
  deliveryAddress: z.string().min(5, "Your delivery address required"),
  phone: z.string().min(9, "Valid phone number required"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function PickupPage() {
  const [screenshotUrl, setScreenshotUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setScreenshotUrl(data.url);
        toast.success("Screenshot uploaded!");
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, screenshotUrl }),
      });
      const result = await res.json();
      if (res.ok) {
        setResult(result);
        toast.success("Pickup request submitted!");
      } else {
        toast.error(result.error || "Failed to submit request");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-xl text-center">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-accent" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Pickup Request Submitted!</h1>
            <p className="text-muted-foreground mb-6">
              We&apos;ll assign a delivery partner to pick up your order.
            </p>
            <div className="bg-card rounded-2xl border border-border p-6 text-left space-y-4 mb-8">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tracking #</span>
                <span className="font-mono font-bold text-primary">{result.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Fee</span>
                <span className="font-semibold">{formatPrice(result.estimatedFee ?? 5)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Delivery</span>
                <span className="font-semibold">{result.estimatedTime ?? "45-60"} min</span>
              </div>
            </div>
            <Button onClick={() => setResult(null)} variant="outline" className="w-full">
              Submit Another Request
            </Button>
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
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-4">
              <MapPin className="w-4 h-4" /> Personal Pickup Service
            </div>
            <h1 className="text-3xl font-bold mb-3">
              We Pick Up From Anywhere
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Can&apos;t find your favourite restaurant? Just tell us where to go and we&apos;ll pick it up for you.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <h2 className="font-bold text-lg">Restaurant Details</h2>
              <div>
                <Label htmlFor="restaurantName">Restaurant Name *</Label>
                <Input id="restaurantName" placeholder="e.g. Café Daphna" {...register("restaurantName")} className="mt-1" />
                {errors.restaurantName && <p className="text-destructive text-xs mt-1">{errors.restaurantName.message}</p>}
              </div>
              <div>
                <Label htmlFor="restaurantAddress">Restaurant Address *</Label>
                <Input id="restaurantAddress" placeholder="Full address of the restaurant" {...register("restaurantAddress")} className="mt-1" />
                {errors.restaurantAddress && <p className="text-destructive text-xs mt-1">{errors.restaurantAddress.message}</p>}
              </div>
              <div>
                <Label htmlFor="foodDescription">What do you want to order? *</Label>
                <Textarea
                  id="foodDescription"
                  placeholder="List the items you want to order (e.g. 1x Khinkali, 2x Lobiani, 1x Lemonade)"
                  {...register("foodDescription")}
                  className="mt-1 min-h-[100px]"
                />
                {errors.foodDescription && <p className="text-destructive text-xs mt-1">{errors.foodDescription.message}</p>}
              </div>
              <div>
                <Label>Menu Screenshot (optional)</Label>
                <label className={`mt-1 flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${screenshotUrl ? "border-accent bg-accent/5" : "border-border hover:border-primary/50"}`}>
                  <input type="file" accept="image/*" className="sr-only" onChange={handleFileUpload} disabled={uploading} />
                  {screenshotUrl ? (
                    <div className="text-center">
                      <CheckCircle className="w-6 h-6 text-accent mx-auto mb-1" />
                      <p className="text-sm text-accent font-medium">Screenshot uploaded</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                      <p className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Upload menu screenshot"}</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <h2 className="font-bold text-lg">Delivery Details</h2>
              <div>
                <Label htmlFor="deliveryAddress">Your Delivery Address *</Label>
                <Textarea id="deliveryAddress" placeholder="Where should we deliver to?" {...register("deliveryAddress")} className="mt-1 min-h-[80px]" />
                {errors.deliveryAddress && <p className="text-destructive text-xs mt-1">{errors.deliveryAddress.message}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Your Phone Number *</Label>
                <Input id="phone" placeholder="+995 555 XXX XXX" {...register("phone")} className="mt-1" />
                {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <Label htmlFor="notes">Additional Notes (optional)</Label>
                <Textarea id="notes" placeholder="Any special instructions..." {...register("notes")} className="mt-1 min-h-[60px]" />
              </div>
            </div>

            {/* Pricing info */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Pricing & Timing</p>
                <p className="text-muted-foreground">
                  Base delivery fee: ₾3–₾8 based on distance. Estimated delivery: 45–90 minutes. You&apos;ll see the exact fee after submission.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white h-13 font-semibold text-base"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Pickup Request"}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
