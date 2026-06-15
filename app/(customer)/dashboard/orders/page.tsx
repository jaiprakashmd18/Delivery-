import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30",
  ACCEPTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30",
  PREPARING: "bg-orange-100 text-orange-700 dark:bg-orange-900/30",
  PICKED_UP: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-primary/10 text-primary",
  DELIVERED: "bg-accent/10 text-accent",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30",
  REFUNDED: "bg-gray-100 text-gray-600",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      restaurant: { select: { name: true, image: true } },
      items: { include: { menuItem: { select: { name: true } } }, take: 2 },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Your order history will appear here</p>
          <Link href="/restaurants">
            <Button className="bg-primary hover:bg-primary/90 text-white">Order Now</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-xl shrink-0">
                  {order.type === "FOOD" ? "🍽️" : order.type === "GROCERY" ? "🛒" : order.type === "PARCEL" ? "📦" : "🛵"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-semibold">
                      {order.restaurant?.name ?? order.type.replace(/_/g, " ")}
                    </p>
                    <Badge className={`${STATUS_COLORS[order.status]} border-0 text-xs`}>
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{order.orderNumber}</p>
                  {order.items.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {order.items.map((i) => i.menuItem.name).join(", ")}
                      {order.items.length > 2 ? "..." : ""}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm">
                      <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                      <span className="text-muted-foreground ml-2">· {formatDate(order.createdAt)}</span>
                    </p>
                    <Link href={`/dashboard/orders/${order.id}`}>
                      <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs">
                        Details <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
