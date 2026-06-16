export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Star, MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function RestaurantReviewsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const restaurant = await prisma.restaurant.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true, name: true, rating: true, totalRatings: true },
  });

  if (!restaurant) redirect("/restaurant");

  const reviews = await prisma.review.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, image: true } },
    },
    take: 50,
  });

  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: reviews.filter((rv) => rv.rating === r).length,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Customer Reviews</h1>
        <p className="text-muted-foreground text-sm">{restaurant.name}</p>
      </div>

      {/* Rating overview */}
      <div className="bg-card rounded-2xl border border-border p-6 flex flex-col sm:flex-row gap-6">
        <div className="text-center sm:border-r sm:border-border sm:pr-6">
          <div className="text-5xl font-bold text-primary">{restaurant.rating.toFixed(1)}</div>
          <div className="flex items-center justify-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${s <= Math.round(restaurant.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{restaurant.totalRatings} reviews</p>
        </div>
        <div className="flex-1 space-y-2">
          {ratingDist.map(({ stars, count }) => {
            const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-sm">
                <span className="w-3 text-muted-foreground">{stars}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right text-muted-foreground text-xs">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No reviews yet</h3>
          <p className="text-muted-foreground text-sm">Customer reviews will appear here after they rate their orders.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {review.user.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm">{review.user.name ?? "Anonymous"}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{formatDate(review.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-0.5 my-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
