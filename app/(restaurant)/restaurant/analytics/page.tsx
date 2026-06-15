export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TrendingUp, ShoppingCart, DollarSign, Star, Users } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default async function RestaurantAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const restaurant = await prisma.restaurant.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true, name: true, rating: true, totalRatings: true },
  });

  if (!restaurant) redirect("/restaurant");

  const now = new Date();
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30);

  const [
    totalRevenue, weekRevenue, monthRevenue,
    totalOrders, weekOrders, monthOrders,
    avgOrderValue,
    topItems,
    uniqueCustomers,
  ] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: { restaurantId: restaurant.id, status: "DELIVERED" } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { restaurantId: restaurant.id, status: "DELIVERED", createdAt: { gte: weekAgo } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { restaurantId: restaurant.id, status: "DELIVERED", createdAt: { gte: monthAgo } } }),
    prisma.order.count({ where: { restaurantId: restaurant.id, status: "DELIVERED" } }),
    prisma.order.count({ where: { restaurantId: restaurant.id, status: "DELIVERED", createdAt: { gte: weekAgo } } }),
    prisma.order.count({ where: { restaurantId: restaurant.id, status: "DELIVERED", createdAt: { gte: monthAgo } } }),
    prisma.order.aggregate({ _avg: { total: true }, where: { restaurantId: restaurant.id, status: "DELIVERED" } }),
    prisma.orderItem.groupBy({
      by: ["menuItemId"],
      where: { order: { restaurantId: restaurant.id, status: "DELIVERED" } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.order.groupBy({
      by: ["customerId"],
      where: { restaurantId: restaurant.id },
      _count: true,
    }),
  ]);

  const menuItemIds = topItems.map((t) => t.menuItemId);
  const menuItemNames = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
    select: { id: true, name: true },
  });
  const nameMap = Object.fromEntries(menuItemNames.map((m) => [m.id, m.name]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm">{restaurant.name}</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatPrice(totalRevenue._sum.total ?? 0), icon: DollarSign, color: "text-primary", sub: `${formatPrice(monthRevenue._sum.total ?? 0)} this month` },
          { label: "Total Orders", value: totalOrders.toString(), icon: ShoppingCart, color: "text-blue-500", sub: `${monthOrders} this month` },
          { label: "Avg Order Value", value: formatPrice(avgOrderValue._avg.total ?? 0), icon: TrendingUp, color: "text-accent", sub: "Per completed order" },
          { label: "Unique Customers", value: uniqueCustomers.length.toString(), icon: Users, color: "text-purple-500", sub: "All time" },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4">
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Period comparison */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-semibold mb-4">Revenue Breakdown</h2>
        <div className="grid grid-cols-3 gap-6 text-center">
          {[
            { label: "Today", orders: weekOrders, revenue: weekRevenue._sum.total },
            { label: "Last 7 Days", orders: weekOrders, revenue: weekRevenue._sum.total },
            { label: "Last 30 Days", orders: monthOrders, revenue: monthRevenue._sum.total },
          ].map(({ label, orders, revenue }) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-xl font-bold text-primary">{formatPrice(revenue ?? 0)}</p>
              <p className="text-xs text-muted-foreground">{orders} orders</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Top Selling Items</h2>
        </div>
        {topItems.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground text-sm">No sales data yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {topItems.map((item, i) => (
              <div key={item.menuItemId} className="p-4 flex items-center gap-4">
                <span className="text-2xl font-bold text-muted-foreground/30 w-8 text-center">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-medium">{nameMap[item.menuItemId] ?? "Unknown item"}</p>
                </div>
                <span className="font-bold text-primary">{item._sum.quantity ?? 0} sold</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="bg-card rounded-xl border border-border p-6 flex items-center gap-6">
        <div className="text-center">
          <div className="flex items-center gap-1 justify-center">
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            <span className="text-3xl font-bold">{restaurant.rating.toFixed(1)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Average Rating</p>
        </div>
        <div className="flex-1 border-l border-border pl-6">
          <p className="text-2xl font-bold">{restaurant.totalRatings}</p>
          <p className="text-xs text-muted-foreground">Total Reviews</p>
        </div>
      </div>
    </div>
  );
}
