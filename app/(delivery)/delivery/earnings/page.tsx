export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DollarSign, TrendingUp, Calendar, Bike } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default async function DeliveryEarningsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const partner = await prisma.deliveryPartner.findUnique({
    where: { userId: session.user.id },
    select: { id: true, totalEarnings: true, rating: true, completedDeliveries: true },
  });

  if (!partner) redirect("/delivery");

  const now = new Date();
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30);

  const [todayEarnings, weekEarnings, monthEarnings, todayDeliveries, weekDeliveries] = await Promise.all([
    prisma.order.aggregate({
      where: { deliveryPartnerId: partner.id, status: "DELIVERED", deliveredAt: { gte: today } },
      _sum: { deliveryFee: true },
    }),
    prisma.order.aggregate({
      where: { deliveryPartnerId: partner.id, status: "DELIVERED", deliveredAt: { gte: weekAgo } },
      _sum: { deliveryFee: true },
    }),
    prisma.order.aggregate({
      where: { deliveryPartnerId: partner.id, status: "DELIVERED", deliveredAt: { gte: monthAgo } },
      _sum: { deliveryFee: true },
    }),
    prisma.order.count({
      where: { deliveryPartnerId: partner.id, status: "DELIVERED", deliveredAt: { gte: today } },
    }),
    prisma.order.count({
      where: { deliveryPartnerId: partner.id, status: "DELIVERED", deliveredAt: { gte: weekAgo } },
    }),
  ]);

  const avgEarningPerDelivery = partner.completedDeliveries > 0
    ? partner.totalEarnings / partner.completedDeliveries
    : 0;

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">Earnings</h1>

      {/* Total earned card */}
      <div className="bg-gradient-to-br from-primary to-orange-600 rounded-2xl p-6 text-white">
        <DollarSign className="w-7 h-7 mb-2 opacity-80" />
        <p className="text-sm opacity-80">Total Earnings (All Time)</p>
        <p className="text-4xl font-bold mt-1">{formatPrice(partner.totalEarnings)}</p>
        <p className="text-sm opacity-70 mt-2">{partner.completedDeliveries} deliveries completed</p>
      </div>

      {/* Period breakdown */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Today", amount: todayEarnings._sum.deliveryFee ?? 0, deliveries: todayDeliveries, icon: Calendar },
          { label: "This Week", amount: weekEarnings._sum.deliveryFee ?? 0, deliveries: weekDeliveries, icon: TrendingUp },
          { label: "This Month", amount: monthEarnings._sum.deliveryFee ?? 0, deliveries: null, icon: Bike },
        ].map(({ label, amount, deliveries, icon: Icon }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4 text-center">
            <Icon className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">{formatPrice(amount)}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            {deliveries !== null && (
              <p className="text-xs text-muted-foreground/60 mt-0.5">{deliveries} trips</p>
            )}
          </div>
        ))}
      </div>

      {/* Performance metrics */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <h3 className="font-semibold">Performance</h3>
        {[
          { label: "Average per Delivery", value: formatPrice(avgEarningPerDelivery) },
          { label: "Customer Rating", value: `${partner.rating.toFixed(1)} / 5.0` },
          { label: "Total Deliveries", value: partner.completedDeliveries.toString() },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="font-semibold text-sm">{value}</span>
          </div>
        ))}
      </div>

      {/* Earnings info */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-1.5 text-sm">
        <p className="font-semibold text-primary">How Earnings Work</p>
        <p className="text-muted-foreground">• You earn the full delivery fee for each completed order</p>
        <p className="text-muted-foreground">• Fees vary by distance and order size</p>
        <p className="text-muted-foreground">• Earnings are added to your wallet after delivery</p>
        <p className="text-muted-foreground">• Bonuses may apply during peak hours</p>
      </div>
    </div>
  );
}
