export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TrendingUp, Users, ShoppingCart, DollarSign, Store, Bike, Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") redirect("/");

  const now = new Date();
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30);

  const [
    totalUsers, newUsersWeek, newUsersMonth,
    totalOrders, ordersWeek, ordersMonth,
    totalRevenue, revenueWeek, revenueMonth,
    totalRestaurants, activeRestaurants,
    totalPartners, avgOrderValue,
    topRestaurants,
    ordersByStatus,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.order.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: "DELIVERED" } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: "DELIVERED", createdAt: { gte: weekAgo } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: "DELIVERED", createdAt: { gte: monthAgo } } }),
    prisma.restaurant.count(),
    prisma.restaurant.count({ where: { isActive: true } }),
    prisma.deliveryPartner.count(),
    prisma.order.aggregate({ _avg: { total: true }, where: { status: "DELIVERED" } }),
    prisma.restaurant.findMany({
      orderBy: { totalRatings: "desc" },
      take: 5,
      select: { name: true, rating: true, totalRatings: true, _count: { select: { orders: true } } },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const statusMap = Object.fromEntries(ordersByStatus.map((s) => [s.status, s._count]));

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Platform Analytics</h1>
        <p className="text-muted-foreground text-sm">Comprehensive platform performance overview</p>
      </div>

      {/* Platform KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatPrice(totalRevenue._sum.total ?? 0), sub: `${formatPrice(revenueMonth._sum.total ?? 0)} this month`, icon: DollarSign, color: "text-primary" },
          { label: "Total Orders", value: totalOrders.toLocaleString(), sub: `${ordersMonth} this month`, icon: ShoppingCart, color: "text-blue-500" },
          { label: "Total Users", value: totalUsers.toLocaleString(), sub: `+${newUsersMonth} this month`, icon: Users, color: "text-accent" },
          { label: "Avg Order Value", value: formatPrice(avgOrderValue._avg.total ?? 0), sub: "Per completed order", icon: TrendingUp, color: "text-purple-500" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4">
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Weekly comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 col-span-3">
          <h2 className="font-semibold mb-4">Period Comparison</h2>
          <div className="grid grid-cols-3 gap-6">
            {[
              { period: "Last 7 Days", orders: ordersWeek, revenue: revenueWeek._sum.total ?? 0, users: newUsersWeek },
              { period: "Last 30 Days", orders: ordersMonth, revenue: revenueMonth._sum.total ?? 0, users: newUsersMonth },
              { period: "All Time", orders: totalOrders, revenue: totalRevenue._sum.total ?? 0, users: totalUsers },
            ].map(({ period, orders, revenue, users }) => (
              <div key={period} className="text-center">
                <p className="text-xs text-muted-foreground font-medium mb-3">{period}</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xl font-bold text-primary">{formatPrice(revenue)}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{orders}</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{users}</p>
                    <p className="text-xs text-muted-foreground">New Users</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform composition */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Store className="w-4 h-4" /> Platform Composition
          </h2>
          <div className="space-y-3">
            {[
              { label: "Total Restaurants", value: totalRestaurants, sub: `${activeRestaurants} active`, icon: Store, color: "text-primary" },
              { label: "Delivery Partners", value: totalPartners, sub: "Registered riders", icon: Bike, color: "text-accent" },
              { label: "Registered Users", value: totalUsers, sub: `+${newUsersWeek} this week`, icon: Users, color: "text-blue-500" },
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
                <span className="font-bold">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order status breakdown */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold mb-4">Order Status Breakdown</h2>
          <div className="space-y-3">
            {["DELIVERED", "PENDING", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY", "CANCELLED"].map((status) => {
              const count = statusMap[status] ?? 0;
              const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{status.replace(/_/g, " ")}</span>
                    <span className="font-medium">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top restaurants */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Top Restaurants</h2>
        </div>
        <div className="divide-y divide-border">
          {topRestaurants.map((r, i) => (
            <div key={r.name} className="p-4 flex items-center gap-4">
              <span className="text-2xl font-bold text-muted-foreground/30 w-8 text-center">{i + 1}</span>
              <div className="flex-1">
                <p className="font-medium">{r.name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {r.rating.toFixed(1)} ({r.totalRatings} reviews)
                </div>
              </div>
              <span className="font-bold text-primary">{r._count.orders} orders</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
