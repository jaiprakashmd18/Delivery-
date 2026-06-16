export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClipboardList, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30",
  ACCEPTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30",
  PREPARING: "bg-orange-100 text-orange-700 dark:bg-orange-900/30",
  PICKED_UP: "bg-purple-100 text-purple-700 dark:bg-purple-900/30",
  OUT_FOR_DELIVERY: "bg-primary/10 text-primary",
  DELIVERED: "bg-accent/10 text-accent",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30",
};

export default async function RestaurantOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const restaurant = await prisma.restaurant.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true, name: true },
  });

  if (!restaurant) redirect("/restaurant");

  const orders = await prisma.order.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      items: { include: { menuItem: { select: { name: true } } } },
      customer: { select: { name: true, phone: true } },
    },
  });

  const activeOrders = orders.filter((o) =>
    ["PENDING", "ACCEPTED", "PREPARING"].includes(o.status)
  );
  const completedOrders = orders.filter((o) =>
    !["PENDING", "ACCEPTED", "PREPARING"].includes(o.status)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Order Management</h1>
        <p className="text-muted-foreground text-sm">{restaurant.name}</p>
      </div>

      {/* Active Orders */}
      <section>
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          Active Orders ({activeOrders.length})
        </h2>
        {activeOrders.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <ClipboardList className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No active orders right now</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {activeOrders.map((order) => (
              <div key={order.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs text-primary">{order.orderNumber}</span>
                    <p className="font-medium text-sm mt-0.5">{order.customer.name}</p>
                    {order.customer.phone && (
                      <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                    )}
                  </div>
                  <Badge className={`${STATUS_COLORS[order.status]} border-0 text-xs shrink-0`}>
                    {order.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="space-y-0.5">
                  {order.items.map((item) => (
                    <p key={item.id} className="text-sm text-muted-foreground">
                      {item.quantity}× {item.menuItem.name}
                    </p>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt, { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Order History */}
      <section>
        <h2 className="font-semibold text-lg mb-4">Order History</h2>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {completedOrders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground text-sm">No completed orders yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {completedOrders.map((order) => (
                <div key={order.id} className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-primary">{order.orderNumber}</span>
                      <Badge className={`${STATUS_COLORS[order.status]} border-0 text-xs`}>
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                      {order.customer.name} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-sm">{formatPrice(order.total)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
