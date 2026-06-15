"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Package, MapPin, User, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

const schema = z.object({
  pickupAddress: z.string().min(5, "Pickup address required"),
  dropAddress: z.string().min(5, "Drop-off address required"),
  parcelType: z.string().min(1, "Parcel type required"),
  parcelSize: z.string().min(1, "Parcel size required"),
  parcelWeight: z.string().min(1, "Approximate weight required"),
  parcelDescription: z.string().min(3, "Brief description required"),
  receiverName: z.string().min(2, "Receiver name required"),
  receiverPhone: z.string().min(9, "Receiver phone required"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ParcelPage() {
  const [isFragile, setIsFragile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/parcel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, isFragile }),
      });
      const result = await res.json();
      if (res.ok) { setResult(result); toast.success("Parcel delivery request submitted!"); }
      else { toast.error(result.error || "Failed to submit"); }
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
            <h1 className="text-2xl font-bold mb-2">Parcel Request Submitted!</h1>
            <p className="text-muted-foreground mb-6">A delivery partner will be assigned shortly.</p>
            <div className="bg-card rounded-2xl border border-border p-5 text-left space-y-3 mb-6">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tracking #</span><span className="font-mono font-bold text-primary">{result.orderNumber}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Estimated Fee</span><span className="font-semibold">{formatPrice(result.estimatedFee ?? 5)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Est. Time</span><span className="font-semibold">{result.estimatedTime ?? "30-60"} min</span></div>
            </div>
            <Button onClick={() => setResult(null)} variant="outline" className="w-full">New Request</Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const Field = ({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1">{children}</div>
      {error && <p className="text-destructive text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-4">
              <Package className="w-4 h-4" /> Parcel Delivery
            </div>
            <h1 className="text-3xl font-bold mb-3">Send Parcels Anywhere</h1>
            <p className="text-muted-foreground">Fast and reliable parcel delivery across the city.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Addresses */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <h2 className="font-bold text-lg flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Addresses</h2>
              <Field id="pickupAddress" label="Pickup Address *" error={errors.pickupAddress?.message}>
                <Textarea id="pickupAddress" placeholder="Where to pick up the parcel" {...register("pickupAddress")} className="min-h-[70px]" />
              </Field>
              <Field id="dropAddress" label="Drop-off Address *" error={errors.dropAddress?.message}>
                <Textarea id="dropAddress" placeholder="Where to deliver the parcel" {...register("dropAddress")} className="min-h-[70px]" />
              </Field>
            </div>

            {/* Parcel Details */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <h2 className="font-bold text-lg flex items-center gap-2"><Package className="w-4 h-4 text-primary" /> Parcel Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type *</Label>
                  <Select onValueChange={(v) => setValue("parcelType", v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {["Documents", "Clothing", "Electronics", "Food", "Other"].map((t) => (
                        <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.parcelType && <p className="text-destructive text-xs mt-1">{errors.parcelType.message}</p>}
                </div>
                <div>
                  <Label>Size *</Label>
                  <Select onValueChange={(v) => setValue("parcelSize", v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select size" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (fits in a bag)</SelectItem>
                      <SelectItem value="medium">Medium (shoebox size)</SelectItem>
                      <SelectItem value="large">Large (suitcase size)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.parcelSize && <p className="text-destructive text-xs mt-1">{errors.parcelSize.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Approx. Weight *</Label>
                  <Select onValueChange={(v) => setValue("parcelWeight", v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select weight" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1kg">Under 1 kg</SelectItem>
                      <SelectItem value="1-5kg">1 – 5 kg</SelectItem>
                      <SelectItem value="5-10kg">5 – 10 kg</SelectItem>
                      <SelectItem value="10kg+">Over 10 kg</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.parcelWeight && <p className="text-destructive text-xs mt-1">{errors.parcelWeight.message}</p>}
                </div>
                <div className="flex items-end gap-3 pb-0.5">
                  <div className="flex items-center gap-2 mt-5">
                    <Switch id="fragile" checked={isFragile} onCheckedChange={setIsFragile} />
                    <Label htmlFor="fragile" className="flex items-center gap-1 cursor-pointer">
                      <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" /> Fragile
                    </Label>
                  </div>
                </div>
              </div>
              <Field id="parcelDescription" label="Description *" error={errors.parcelDescription?.message}>
                <Input id="parcelDescription" placeholder="Brief description of the parcel" {...register("parcelDescription")} />
              </Field>
            </div>

            {/* Receiver */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <h2 className="font-bold text-lg flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Receiver Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field id="receiverName" label="Receiver Name *" error={errors.receiverName?.message}>
                  <Input id="receiverName" placeholder="Full name" {...register("receiverName")} />
                </Field>
                <Field id="receiverPhone" label="Receiver Phone *" error={errors.receiverPhone?.message}>
                  <Input id="receiverPhone" placeholder="+995 555 XXX XXX" {...register("receiverPhone")} />
                </Field>
              </div>
              <Field id="notes" label="Notes (optional)" error={undefined}>
                <Textarea id="notes" placeholder="Any special instructions for the delivery" {...register("notes")} className="min-h-[60px]" />
              </Field>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white h-12 font-semibold"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Parcel Request"}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
