export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Tag, Percent, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";

export default async function AdminCouponsPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") redirect("/");

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { usages: true } } },
  });

  const now = new Date();

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Coupons & Promotions</h1>
          <p className="text-muted-foreground text-sm">Manage discount codes and promotions</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Coupons", value: coupons.length, color: "text-primary" },
          { label: "Active", value: coupons.filter((c) => c.isActive && (!c.endDate || c.endDate > now)).length, color: "text-accent" },
          { label: "Expired", value: coupons.filter((c) => c.endDate && c.endDate <= now).length, color: "text-muted-foreground" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4">
            <Tag className={`w-5 h-5 ${color} mb-2`} />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Coupons list */}
      {coupons.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Tag className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No coupons yet</h3>
          <p className="text-muted-foreground text-sm">Create discount codes for your customers.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {coupons.map((coupon) => {
            const isExpired = coupon.endDate && coupon.endDate <= now;
            const isActive = coupon.isActive && !isExpired;

            return (
              <div key={coupon.id} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg text-primary">{coupon.code}</span>
                      <Badge className={`${isActive ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"} border-0 text-xs`}>
                        {isExpired ? "Expired" : isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {coupon.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">{coupon.description}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-primary font-bold">
                      {coupon.discountType === "percentage" ? (
                        <>
                          <Percent className="w-4 h-4" />
                          <span>{coupon.discountValue}% off</span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4" />
                          <span>{formatPrice(coupon.discountValue)} off</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                  <div>
                    <span className="font-medium">Used:</span> {coupon._count.usages}
                    {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                  </div>
                  <div>
                    <span className="font-medium">Min order:</span> {formatPrice(coupon.minOrderAmount)}
                  </div>
                  {coupon.maxDiscount && (
                    <div>
                      <span className="font-medium">Max discount:</span> {formatPrice(coupon.maxDiscount)}
                    </div>
                  )}
                  {coupon.endDate && (
                    <div>
                      <span className="font-medium">Expires:</span> {formatDate(coupon.endDate)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
