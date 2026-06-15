import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { RestaurantCard } from "./restaurant-card";
import type { RestaurantWithDetails } from "@/types";

interface RestaurantGridProps {
  restaurants?: RestaurantWithDetails[];
  className?: string;
  emptyMessage?: string;
}

export async function RestaurantGrid({
  restaurants: propRestaurants,
  className,
  emptyMessage = "No restaurants found.",
}: RestaurantGridProps) {
  let restaurants: RestaurantWithDetails[];
  if (propRestaurants) {
    restaurants = propRestaurants;
  } else {
    const raw = await prisma.restaurant.findMany({
      where: { isActive: true },
      include: {
        categories: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
        menuItems: { where: { isAvailable: true }, take: 10 },
        reviews: { select: { rating: true }, take: 50 },
      },
      orderBy: [{ isFeatured: "desc" }, { rating: "desc" }],
      take: 24,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    restaurants = raw.map((r) => ({
      ...r,
      averageRating: r.rating,
      isOpen: true,
      cuisineType: [] as string[],
      openingHours: r.openingHours as RestaurantWithDetails["openingHours"],
    })) as unknown as RestaurantWithDetails[];
  }

  if (restaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4">🍽️</div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          No restaurants found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
        className
      )}
    >
      {restaurants.map((restaurant, index) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
