import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StatsCard from "@/components/admin/stats-card";
import { formatPrice, formatDate } from "@/lib/utils";
import { Users, ShoppingCart, DollarSign, Bike } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") redirect("/");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalUsers, newUsersToday, totalOrders, ordersToday,
    revenueResult, revenueTodayResult, activeDeliveries, recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: "DELIVERED" } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: "DELIVERED", createdAt: { gte: today } } }),
    prisma.order.count({ where: { status: { in: ["ACCEPTED", "PREPARING", "PICKED_UP", "OUT_FOR_DELIVERY"] } } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        customer: { select: { name: true } },
        restaurant: { select: { name: true } },
      },
    }),
  ]);

  const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    ACCEPTED: "bg-blue-100 text-blue-700",
    PREPARING: "bg-orange-100 text-orange-700",
    OUT_FOR_DELIVERY: "bg-primary/10 text-primary",
    DELIVERED: "bg-accent/10 text-accent",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">Platform overview and analytics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Revenue" value={formatPrice(revenueResult._sum.total ?? 0)} changeLabel={`+${formatPrice(revenueTodayResult._sum.total ?? 0)} today`} icon={<DollarSign className="w-5 h-5" />} color="orange" />
        <StatsCard label="Total Orders" value={totalOrders} changeLabel={`+${ordersToday} today`} icon={<ShoppingCart className="w-5 h-5" />} color="blue" />
        <StatsCard label="Total Users" value={totalUsers} changeLabel={`+${newUsersToday} today`} icon={<Users className="w-5 h-5" />} color="green" />
        <StatsCard label="Active Deliveries" value={activeDeliveries} changeLabel="Live" icon={<Bike className="w-5 h-5" />} color="purple" />
      </div>

      {/* Recent Orders */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order #</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Restaurant</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{order.orderNumber}</td>
                  <td className="px-4 py-3">{order.customer.name ?? "—"}</td>
                  <td className="px-4 py-3">{order.restaurant?.name ?? order.type.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <Badge className={`${STATUS_COLORS[order.status] ?? "bg-muted text-muted-foreground"} border-0 text-xs`}>
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
