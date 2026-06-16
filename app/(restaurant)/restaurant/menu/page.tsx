export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UtensilsCrossed, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export default async function RestaurantMenuPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const restaurant = await prisma.restaurant.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true, name: true },
  });

  if (!restaurant) redirect("/restaurant");

  const categories = await prisma.restaurantCategory.findMany({
    where: { restaurantId: restaurant.id },
    include: {
      menuItems: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const uncategorizedItems = await prisma.menuItem.findMany({
    where: { restaurantId: restaurant.id, categoryId: null },
    orderBy: { createdAt: "asc" },
  });

  const allItems = categories.flatMap((c) => c.menuItems).length + uncategorizedItems.length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground text-sm">{allItems} items across {categories.length} categories</p>
        </div>
      </div>

      {categories.length === 0 && uncategorizedItems.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <UtensilsCrossed className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No menu items yet</h3>
          <p className="text-muted-foreground text-sm">
            Contact your administrator to add menu items and categories.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((cat) => (
            <section key={cat.id}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-bold text-lg">{cat.name}</h2>
                <span className="text-sm text-muted-foreground">({cat.menuItems.length} items)</span>
                {!cat.isActive && (
                  <Badge className="bg-red-100 text-red-700 border-0 text-xs">Hidden</Badge>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {cat.menuItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}

          {uncategorizedItems.length > 0 && (
            <section>
              <h2 className="font-bold text-lg mb-4">Uncategorized</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {uncategorizedItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItemCard({ item }: {
  item: {
    id: string; name: string; description: string | null;
    price: number; image: string | null; isAvailable: boolean; isVeg: boolean;
  };
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 flex gap-3">
      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <Package className="w-6 h-6 text-muted-foreground/40" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p className="font-medium text-sm truncate">{item.name}</p>
          <div className="flex items-center gap-1 shrink-0">
            {item.isVeg && (
              <span className="w-4 h-4 border-2 border-accent rounded-sm flex items-center justify-center">
                <span className="w-2 h-2 bg-accent rounded-full" />
              </span>
            )}
            {!item.isAvailable && (
              <Badge className="bg-red-100 text-red-700 border-0 text-xs">Off</Badge>
            )}
          </div>
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
        )}
        <p className="font-bold text-primary text-sm mt-1">{formatPrice(item.price)}</p>
      </div>
    </div>
  );
}
