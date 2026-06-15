export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: "bg-accent/10 text-accent",
  CANCELLED: "bg-red-100 text-red-700",
  OUT_FOR_DELIVERY: "bg-primary/10 text-primary",
};

export default async function DeliveryHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const partner = await prisma.deliveryPartner.findUnique({
    where: { userId: session.user.id },
    select: { id: true, totalDeliveries: true, completedDeliveries: true },
  });

  if (!partner) redirect("/delivery");

  const deliveries = await prisma.order.findMany({
    where: {
      deliveryPartnerId: partner.id,
      status: { in: ["DELIVERED", "CANCELLED"] },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      restaurant: { select: { name: true } },
      customer: { select: { name: true } },
    },
  });

  const totalEarned = deliveries
    .filter((d) => d.status === "DELIVERED")
    .reduce((sum, d) => sum + d.deliveryFee, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Delivery History</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <CheckCircle className="w-5 h-5 text-accent mx-auto mb-1" />
          <p className="text-2xl font-bold">{partner.completedDeliveries}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold">{partner.totalDeliveries}</p>
          <p className="text-xs text-muted-foreground">Total Accepted</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Earned</p>
          <p className="text-xl font-bold text-primary">{formatPrice(totalEarned)}</p>
          <p className="text-xs text-muted-foreground">From history</p>
        </div>
      </div>

      {/* List */}
      {deliveries.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <CheckCircle className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No deliveries yet</h3>
          <p className="text-muted-foreground text-sm">Your completed deliveries will appear here.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="p-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-primary">{delivery.orderNumber}</span>
                  <Badge className={`${STATUS_COLORS[delivery.status] ?? "bg-muted text-muted-foreground"} border-0 text-xs`}>
                    {delivery.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="font-medium text-sm mt-0.5">{delivery.restaurant?.name}</p>
                <p className="text-xs text-muted-foreground">→ {delivery.customer?.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {delivery.deliveredAt
                    ? formatDate(delivery.deliveredAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                    : formatDate(delivery.updatedAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-primary">{formatPrice(delivery.deliveryFee)}</p>
                <p className="text-xs text-muted-foreground">earned</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
