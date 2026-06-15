import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default async function AdminRestaurantsPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") redirect("/");

  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { name: true, email: true } },
      _count: { select: { orders: true, menuItems: true } },
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Restaurants</h1>
        <p className="text-muted-foreground text-sm">{restaurants.length} restaurants total</p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Restaurant", "Owner", "Rating", "Orders", "Menu Items", "Delivery Fee", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {restaurants.map((r) => (
                <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.city}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm">{r.owner.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{r.owner.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span>{r.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">{r._count.orders}</td>
                  <td className="px-4 py-3 text-center">{r._count.menuItems}</td>
                  <td className="px-4 py-3">{formatPrice(r.deliveryFee)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      <Badge className={r.isActive ? "bg-accent/10 text-accent border-0 text-xs" : "bg-red-100 text-red-700 border-0 text-xs"}>
                        {r.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {r.isVerified && <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">Verified</Badge>}
                      {r.isFeatured && <Badge className="bg-primary/10 text-primary border-0 text-xs">Featured</Badge>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
