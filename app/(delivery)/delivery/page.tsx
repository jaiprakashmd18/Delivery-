export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Truck, DollarSign, Star, CheckCircle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export default async function DeliveryDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const partner = await prisma.deliveryPartner.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true } } },
  });

  if (!partner) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold mb-2">Partner account not found</h2>
        <p className="text-muted-foreground">Please contact support to set up your delivery partner account.</p>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayDeliveries, todayEarnings, availableOrders] = await Promise.all([
    prisma.order.count({
      where: { deliveryPartnerId: partner.id, status: "DELIVERED", deliveredAt: { gte: today } },
    }),
    prisma.order.aggregate({
      where: { deliveryPartnerId: partner.id, status: "DELIVERED", deliveredAt: { gte: today } },
      _sum: { deliveryFee: true },
    }),
    prisma.order.findMany({
      where: { status: "PENDING", deliveryPartnerId: null, type: "FOOD" },
      take: 5,
      include: { restaurant: { select: { name: true, address: true } } },
    }),
  ]);

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {partner.user.name?.split(" ")[0]} 👋</h1>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-sm text-accent font-medium">Online & Ready</span>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <CheckCircle className="w-6 h-6 text-accent mx-auto mb-1" />
          <p className="text-2xl font-bold">{todayDeliveries}</p>
          <p className="text-xs text-muted-foreground">Deliveries Today</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <DollarSign className="w-6 h-6 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold">{formatPrice(todayEarnings._sum.deliveryFee ?? 0)}</p>
          <p className="text-xs text-muted-foreground">Earned Today</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
          <p className="text-2xl font-bold">{partner.rating.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">Rating</p>
        </div>
      </div>

      {/* Available Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Available Orders</h2>
          <Link href="/delivery/available">
            <Button size="sm" variant="outline" className="gap-1 text-xs">
              See All <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        {availableOrders.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Truck className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="font-medium">No orders available right now</p>
            <p className="text-sm text-muted-foreground mt-1">New orders will appear here when customers place them</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableOrders.map((order) => (
              <div key={order.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-primary">{order.orderNumber}</span>
                  <Badge className="bg-primary/10 text-primary border-0 text-xs">New Order</Badge>
                </div>
                <p className="font-medium">{order.restaurant?.name}</p>
                <p className="text-xs text-muted-foreground mb-3">{order.restaurant?.address}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">{formatPrice(order.deliveryFee)} est.</span>
                  <Link href={`/delivery/active/${order.id}`}>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">Accept</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
