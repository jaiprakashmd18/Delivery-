export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Bell, Package, Tag, AlertCircle, CreditCard, Bike } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ORDER_UPDATE: Package,
  PROMOTION: Tag,
  SYSTEM: AlertCircle,
  PAYMENT: CreditCard,
  DELIVERY: Bike,
};

const TYPE_COLORS: Record<string, string> = {
  ORDER_UPDATE: "bg-primary/10 text-primary",
  PROMOTION: "bg-accent/10 text-accent",
  SYSTEM: "bg-muted text-muted-foreground",
  PAYMENT: "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
  DELIVERY: "bg-purple-100 text-purple-600 dark:bg-purple-900/30",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <Badge className="bg-primary text-white border-0">{unreadCount} unread</Badge>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Bell className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No notifications yet</h3>
          <p className="text-muted-foreground text-sm">
            Order updates, promotions, and system alerts will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border divide-y divide-border overflow-hidden">
          {notifications.map((n) => {
            const Icon = TYPE_ICONS[n.type] ?? Bell;
            const colorClass = TYPE_COLORS[n.type] ?? "bg-muted text-muted-foreground";
            return (
              <div key={n.id} className={`p-4 flex items-start gap-4 ${!n.isRead ? "bg-primary/[0.03]" : ""}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-medium text-sm ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {formatDate(n.createdAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
