"use client";
export const dynamic = "force-dynamic";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get("order");

  return (
    <div className="text-center max-w-md mx-auto px-4 py-20">
      <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-14 h-14 text-accent" />
      </div>
      <h1 className="text-3xl font-bold mb-3">Order Placed!</h1>
      <p className="text-muted-foreground mb-2">
        Your order has been successfully placed and sent to the restaurant.
      </p>
      {orderNumber && (
        <div className="bg-muted rounded-xl px-4 py-3 mb-8 inline-block">
          <p className="text-xs text-muted-foreground">Order Number</p>
          <p className="font-bold text-lg font-mono text-primary">{orderNumber}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-4 text-left">
          <Package className="w-6 h-6 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="font-semibold">Order Received</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-left">
          <Clock className="w-6 h-6 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Est. Delivery</p>
          <p className="font-semibold">30-45 min</p>
        </div>
      </div>

      <div className="space-y-3">
        {orderNumber && (
          <Link href={`/track/${orderNumber}`}>
            <Button className="w-full bg-primary hover:bg-primary/90 text-white h-12 font-semibold">
              Track Your Order <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        )}
        <Link href="/restaurants">
          <Button variant="outline" className="w-full h-12">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
