export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Bike, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-accent/10 text-accent",
  BUSY: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30",
  OFFLINE: "bg-muted text-muted-foreground",
};

export default async function AdminDeliveryPartnersPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") redirect("/");

  const partners = await prisma.deliveryPartner.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true, phone: true, createdAt: true, isVerified: true } },
    },
  });

  const stats = {
    total: partners.length,
    available: partners.filter((p) => p.status === "AVAILABLE").length,
    busy: partners.filter((p) => p.status === "BUSY").length,
    offline: partners.filter((p) => p.status === "OFFLINE").length,
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Delivery Partners</h1>
        <p className="text-muted-foreground text-sm">Manage your delivery fleet</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Partners", value: stats.total, color: "text-primary" },
          { label: "Available", value: stats.available, color: "text-accent" },
          { label: "Busy", value: stats.busy, color: "text-yellow-500" },
          { label: "Offline", value: stats.offline, color: "text-muted-foreground" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4">
            <Bike className={`w-5 h-5 ${color} mb-2`} />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Partners table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">All Partners ({partners.length})</h2>
        </div>
        {partners.length === 0 ? (
          <div className="p-8 text-center">
            <Bike className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No delivery partners registered yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Partner</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Vehicle</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rating</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Deliveries</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Earnings</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {partners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{partner.user.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{partner.user.email}</p>
                        {partner.user.phone && (
                          <p className="text-xs text-muted-foreground">{partner.user.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p>{partner.vehicleType}</p>
                      {partner.vehicleNumber && (
                        <p className="text-xs text-muted-foreground">{partner.vehicleNumber}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${STATUS_COLORS[partner.status]} border-0 text-xs`}>
                        {partner.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span>{partner.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {partner.completedDeliveries}/{partner.totalDeliveries}
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(partner.totalEarnings)}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(partner.user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
