export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { User, Phone, Mail, Bike, Star, Shield, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-accent/10 text-accent",
  BUSY: "bg-yellow-100 text-yellow-700",
  OFFLINE: "bg-muted text-muted-foreground",
};

export default async function DeliveryProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const partner = await prisma.deliveryPartner.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true, email: true, phone: true, createdAt: true, isVerified: true } } },
  });

  if (!partner) redirect("/delivery");

  const { user } = partner;

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* Avatar card */}
      <div className="bg-card rounded-2xl border border-border p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold shrink-0">
          {user.name?.[0]?.toUpperCase() ?? "D"}
        </div>
        <div>
          <h2 className="text-xl font-bold">{user.name ?? "—"}</h2>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-0 text-xs flex items-center gap-1">
              <Bike className="w-3 h-3" /> Delivery Partner
            </Badge>
            <Badge className={`${STATUS_COLORS[partner.status]} border-0 text-xs`}>
              {partner.status}
            </Badge>
            {user.isVerified && (
              <Badge className="bg-accent/10 text-accent border-0 text-xs flex items-center gap-1">
                <Shield className="w-3 h-3" /> Verified
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Contact Information</h3>
        {[
          { icon: User, label: "Full Name", value: user.name },
          { icon: Mail, label: "Email", value: user.email },
          { icon: Phone, label: "Phone", value: user.phone ?? "Not added" },
          { icon: Calendar, label: "Member Since", value: formatDate(user.createdAt) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
            <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-medium text-sm">{value ?? "—"}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Vehicle Info */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Vehicle Information</h3>
        {[
          { label: "Vehicle Type", value: partner.vehicleType },
          { label: "Vehicle Number", value: partner.vehicleNumber ?? "—" },
          { label: "License Number", value: partner.licenseNumber ?? "—" },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
            <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center shrink-0">
              <Bike className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-medium text-sm">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mx-auto mb-1" />
          <p className="text-2xl font-bold">{partner.rating.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">Avg Rating</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Bike className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold">{partner.completedDeliveries}</p>
          <p className="text-xs text-muted-foreground">Deliveries Done</p>
        </div>
      </div>
    </div>
  );
}
