export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { User, Mail, Phone, GraduationCap, BadgeCheck, Calendar, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true, email: true, phone: true, image: true,
      role: true, isVerified: true, studentId: true, university: true,
      studentYear: true, referralCode: true, createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  if (!user) redirect("/login");

  const ROLE_LABELS: Record<string, string> = {
    CUSTOMER: "Customer",
    RESTAURANT_OWNER: "Restaurant Owner",
    DELIVERY_PARTNER: "Delivery Partner",
    ADMIN: "Administrator",
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* Avatar + name card */}
      <div className="bg-card rounded-2xl border border-border p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold shrink-0">
          {user.name?.[0]?.toUpperCase() ?? "U"}
        </div>
        <div>
          <h2 className="text-xl font-bold">{user.name ?? "—"}</h2>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-0 text-xs">
              {ROLE_LABELS[user.role]}
            </Badge>
            {user.isVerified && (
              <Badge className="bg-accent/10 text-accent border-0 text-xs flex items-center gap-1">
                <Shield className="w-3 h-3" /> Verified
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Personal Information</h3>
        {[
          { icon: User, label: "Full Name", value: user.name },
          { icon: Mail, label: "Email Address", value: user.email },
          { icon: Phone, label: "Phone Number", value: user.phone ?? "Not added" },
          { icon: Calendar, label: "Member Since", value: formatDate(user.createdAt) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
            <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-medium text-sm truncate">{value ?? "—"}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Student info */}
      {(user.university || user.studentId) && (
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Student Information</h3>
          {[
            { icon: GraduationCap, label: "University", value: user.university },
            { icon: BadgeCheck, label: "Student ID", value: user.studentId },
            { icon: Calendar, label: "Year", value: user.studentYear },
          ].filter(f => f.value).map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
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
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-primary">{user._count.orders}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Orders</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-primary">{user.referralCode ?? "—"}</p>
          <p className="text-sm text-muted-foreground mt-1">Referral Code</p>
        </div>
      </div>
    </div>
  );
}
