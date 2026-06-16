export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Store, MapPin, Clock, DollarSign, Phone, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export default async function RestaurantSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const restaurant = await prisma.restaurant.findFirst({
    where: { ownerId: session.user.id },
  });

  if (!restaurant) redirect("/restaurant");

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Restaurant Settings</h1>

      {/* Status */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Restaurant Status</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Control whether your restaurant accepts orders
            </p>
          </div>
          <Badge className={restaurant.isActive
            ? "bg-accent/10 text-accent border-0"
            : "bg-red-100 text-red-700 border-0"
          }>
            {restaurant.isActive ? "Open" : "Closed"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-4 bg-muted/50 rounded-lg p-3">
          Contact your administrator to change your restaurant status.
        </p>
      </div>

      {/* Basic Info */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Store className="w-4 h-4" /> Basic Information
        </h3>
        {[
          { icon: Store, label: "Restaurant Name", value: restaurant.name },
          { icon: Info, label: "Description", value: restaurant.description ?? "—" },
          { icon: Phone, label: "Phone", value: restaurant.phone ?? "—" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
            <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-medium text-sm">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Location */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Location
        </h3>
        {[
          { label: "Address", value: restaurant.address },
          { label: "City", value: restaurant.city },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
            <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-medium text-sm">{value ?? "—"}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Settings */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> Delivery Settings
        </h3>
        {[
          { icon: DollarSign, label: "Delivery Fee", value: formatPrice(restaurant.deliveryFee) },
          { icon: DollarSign, label: "Minimum Order", value: formatPrice(restaurant.minOrderAmount) },
          { icon: Clock, label: "Avg. Delivery Time", value: `${restaurant.avgDeliveryTime} minutes` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
            <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-medium text-sm">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
        <p>To update your restaurant settings, please contact your platform administrator.</p>
      </div>
    </div>
  );
}
