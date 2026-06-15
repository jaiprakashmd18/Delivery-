export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MapPin, Home, Briefcase, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  const getLabelIcon = (label: string) => {
    if (label.toLowerCase().includes("home")) return Home;
    if (label.toLowerCase().includes("work") || label.toLowerCase().includes("office")) return Briefcase;
    return MapPin;
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Addresses</h1>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <MapPin className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No addresses saved</h3>
          <p className="text-muted-foreground text-sm">
            Your saved addresses will appear here. Add an address during checkout.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => {
            const Icon = getLabelIcon(addr.label);
            return (
              <div key={addr.id} className="bg-card rounded-xl border border-border p-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm">{addr.label}</span>
                    {addr.isDefault && (
                      <Badge className="bg-primary/10 text-primary border-0 text-xs flex items-center gap-1">
                        <Star className="w-2.5 h-2.5" /> Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{addr.fullAddress}</p>
                  {addr.apartment && (
                    <p className="text-xs text-muted-foreground mt-0.5">Apt: {addr.apartment}</p>
                  )}
                  {addr.landmark && (
                    <p className="text-xs text-muted-foreground">Landmark: {addr.landmark}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">{addr.city}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <MapPin className="w-4 h-4 shrink-0" />
          Addresses are saved automatically when you place an order. Your default address will be pre-selected at checkout.
        </p>
      </div>
    </div>
  );
}
