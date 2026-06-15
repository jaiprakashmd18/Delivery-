import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, ShoppingCart, Wallet, Star, ArrowRight, UtensilsCrossed, ShoppingBag, Truck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-orange-100 text-orange-700",
  PICKED_UP: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-primary/10 text-primary",
  DELIVERED: "bg-accent/10 text-accent",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, recentOrders, wallet] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, university: true, referralCode: true },
    }),
    prisma.order.findMany({
      where: { customerId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        type: true,
        restaurant: { select: { name: true } },
      },
    }),
    prisma.wallet.findUnique({
      where: { userId: session.user.id },
      select: { balance: true, rewardPoints: true },
    }),
  ]);

  const activeOrders = recentOrders.filter((o) =>
    !["DELIVERED", "CANCELLED", "REFUNDED"].includes(o.status)
  );

  const quickActions = [
    { label: "Order Food", href: "/restaurants", icon: UtensilsCrossed, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30" },
    { label: "Grocery", href: "/grocery", icon: ShoppingCart, color: "bg-green-100 text-green-600 dark:bg-green-900/30" },
    { label: "Parcel", href: "/parcel", icon: Package, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30" },
    { label: "Pickup", href: "/pickup", icon: MapPin, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0] ?? "there"}! 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {user?.university ? `Student at ${user.university}` : "Manage your orders and deliveries"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: recentOrders.length, icon: Package, color: "text-primary" },
          { label: "Active Orders", value: activeOrders.length, icon: Truck, color: "text-blue-500" },
          { label: "Reward Points", value: wallet?.rewardPoints ?? 0, icon: Star, color: "text-yellow-500" },
          { label: "Wallet Balance", value: formatPrice(wallet?.balance ?? 0), icon: Wallet, color: "text-accent" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg bg-muted mb-2`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-semibold mb-3">Quick Order</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(({ label, href, icon: Icon, color }) => (
            <Link key={href} href={href}>
              <div className="bg-card rounded-xl border border-border p-4 flex flex-col items-center gap-2 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer text-center">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Active Orders</h2>
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <div key={order.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{order.restaurant?.name ?? order.type.replace("_", " ")}</p>
                  <p className="text-xs text-muted-foreground font-mono">{order.orderNumber}</p>
                </div>
                <Badge className={`${STATUS_COLORS[order.status]} border-0 text-xs shrink-0`}>
                  {order.status.replace(/_/g, " ")}
                </Badge>
                <Link href={`/track/${order.orderNumber}`}>
                  <Button size="sm" variant="outline" className="shrink-0 text-xs h-7">Track</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-medium mb-1">No orders yet</p>
            <p className="text-sm text-muted-foreground mb-4">Start by ordering from a nearby restaurant</p>
            <Link href="/restaurants">
              <Button className="bg-primary hover:bg-primary/90 text-white">Browse Restaurants</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">
                      {order.restaurant?.name ?? order.type.replace(/_/g, " ")}
                    </p>
                    <Badge className={`${STATUS_COLORS[order.status]} border-0 text-[10px] shrink-0`}>
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(order.createdAt)} · {formatPrice(order.total)}
                  </p>
                </div>
                <Link href={`/dashboard/orders/${order.id}`}>
                  <Button size="sm" variant="ghost" className="shrink-0 h-7 px-2">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
