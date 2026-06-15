export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Truck, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/utils";

export default async function AvailableOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const partner = await prisma.deliveryPartner.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!partner) redirect("/delivery");

  const availableOrders = await prisma.order.findMany({
    where: {
      status: "PENDING",
      deliveryPartnerId: null,
      type: "FOOD",
    },
    orderBy: { createdAt: "asc" },
    include: {
      restaurant: { select: { name: true, address: true, city: true } },
      items: { include: { menuItem: { select: { name: true } } } },
      customer: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Available Orders</h1>
        <Badge className="bg-accent/10 text-accent border-0">
          {availableOrders.length} available
        </Badge>
      </div>

      {availableOrders.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Truck className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No orders available right now</h3>
          <p className="text-muted-foreground text-sm">
            New orders from customers will appear here. Check back soon!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {availableOrders.map((order) => (
            <div key={order.id} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-mono text-xs text-primary">{order.orderNumber}</span>
                  <p className="font-semibold mt-0.5">{order.restaurant?.name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {order.restaurant?.address}, {order.restaurant?.city}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-primary">{formatPrice(order.deliveryFee)}</p>
                  <p className="text-xs text-muted-foreground">delivery fee</p>
                </div>
              </div>

              <div className="space-y-0.5 mb-3">
                {order.items.slice(0, 3).map((item) => (
                  <p key={item.id} className="text-sm text-muted-foreground">
                    {item.quantity}× {item.menuItem.name}
                  </p>
                ))}
                {order.items.length > 3 && (
                  <p className="text-xs text-muted-foreground">+{order.items.length - 3} more items</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Order total</p>
                  <p className="font-semibold">{formatPrice(order.total)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt, { hour: "2-digit", minute: "2-digit" })}</p>
                  <Link href={`/delivery/active/${order.id}`}>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                      Accept
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
