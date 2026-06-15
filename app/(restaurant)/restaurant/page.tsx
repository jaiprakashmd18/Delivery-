import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ClipboardList, DollarSign, Star, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-accent/10 text-accent",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function RestaurantDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const restaurant = await prisma.restaurant.findFirst({
    where: { ownerId: session.user.id },
    include: { _count: { select: { orders: true, menuItems: true, reviews: true } } },
  });

  if (!restaurant) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold mb-2">No restaurant found</h2>
        <p className="text-muted-foreground">Contact support to set up your restaurant account.</p>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayRevenue, pendingOrders] = await Promise.all([
    prisma.order.aggregate({
      where: { restaurantId: restaurant.id, status: "DELIVERED", deliveredAt: { gte: today } },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      where: { restaurantId: restaurant.id, status: { in: ["PENDING", "ACCEPTED", "PREPARING"] } },
      orderBy: { createdAt: "asc" },
      take: 10,
      include: { items: { include: { menuItem: { select: { name: true } } } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium">{restaurant.rating.toFixed(1)}</span>
            <span className="text-muted-foreground text-sm">({restaurant.totalRatings} reviews)</span>
          </div>
        </div>
        <Badge className={restaurant.isActive ? "bg-accent/10 text-accent border-0" : "bg-red-100 text-red-700 border-0"}>
          {restaurant.isActive ? "Open" : "Closed"}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Revenue Today", value: formatPrice(todayRevenue._sum.total ?? 0), icon: DollarSign, color: "text-primary" },
          { label: "Pending Orders", value: pendingOrders.length.toString(), icon: ClipboardList, color: "text-orange-500" },
          { label: "Total Orders", value: restaurant._count.orders.toString(), icon: ClipboardList, color: "text-blue-500" },
          { label: "Menu Items", value: restaurant._count.menuItems.toString(), icon: Clock, color: "text-accent" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4">
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Active Orders</h2>
          <Link href="/restaurant/orders">
            <Button size="sm" variant="outline" className="gap-1 text-xs">
              Manage <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <ClipboardList className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="font-medium">No active orders right now</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {pendingOrders.map((order) => (
              <div key={order.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-primary">{order.orderNumber}</span>
                  <Badge className={`${STATUS_COLORS[order.status]} border-0 text-xs`}>
                    {order.status}
                  </Badge>
                </div>
                <div className="text-sm space-y-0.5 mb-3">
                  {order.items.slice(0, 3).map((item) => (
                    <p key={item.id} className="text-muted-foreground">
                      {item.quantity}× {item.menuItem.name}
                    </p>
                  ))}
                </div>
                <p className="font-bold text-primary">{formatPrice(order.total)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
