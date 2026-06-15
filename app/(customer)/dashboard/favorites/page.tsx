export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Heart, Star, Clock, Bike } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      restaurant: {
        select: {
          id: true, name: true, slug: true, image: true, coverImage: true,
          rating: true, totalRatings: true, avgDeliveryTime: true, deliveryFee: true,
          isActive: true, city: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Favorites</h1>
        <span className="text-sm text-muted-foreground">{favorites.length} saved</span>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Heart className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No favorites yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Tap the heart icon on any restaurant to save it here.
          </p>
          <Link href="/restaurants" className="text-primary hover:underline text-sm font-medium">
            Browse restaurants
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favorites.map(({ restaurant: r }) => (
            <Link
              key={r.id}
              href={`/restaurants/${r.slug}`}
              className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="h-36 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 flex items-center justify-center relative">
                {r.coverImage || r.image ? (
                  <img src={(r.coverImage ?? r.image)!} alt={r.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">🍽️</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent" />
                <div className="absolute top-2 right-2">
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                </div>
                {!r.isActive && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">Temporarily Closed</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold group-hover:text-primary transition-colors">{r.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{r.city}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{r.rating.toFixed(1)}</span>
                    <span>({r.totalRatings})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {r.avgDeliveryTime}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Bike className="w-3 h-3" /> {formatPrice(r.deliveryFee)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
