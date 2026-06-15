"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Clock, Bike, BadgeCheck, Flame } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { RestaurantDetail } from "@/types";

interface RestaurantCardProps {
  restaurant: RestaurantDetail;
  className?: string;
  priority?: boolean;
}

function formatDeliveryFee(fee: number): string {
  if (fee === 0) return "Free delivery";
  return `₾${fee.toFixed(2)} delivery`;
}

function formatDeliveryTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function RestaurantCard({
  restaurant,
  className,
  priority = false,
}: RestaurantCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [imgError, setImgError] = useState(false);

  const coverSrc =
    !imgError && (restaurant.coverImage || restaurant.image)
      ? (restaurant.coverImage ?? restaurant.image)!
      : null;

  const ratingDisplay = restaurant.rating.toFixed(1);
  const isHighRated = restaurant.rating >= 4.5;
  const deliveryTime = restaurant.avgDeliveryTime;

  return (
    <Link
      href={`/restaurants/${restaurant.slug}`}
      className={cn(
        "group block rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800",
        "bg-white dark:bg-gray-900 shadow-sm",
        "transition-all duration-300 ease-out",
        "hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/20",
        className
      )}
    >
      {/* Cover image */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt={`${restaurant.name} cover`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0YzRjRGNiIvPjwvc3ZnPg=="
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <span className="text-4xl">🍽️</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {restaurant.isFeatured && (
            <span className="inline-flex items-center gap-1 bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">
              <BadgeCheck className="h-3 w-3" />
              Featured
            </span>
          )}
          {isHighRated && (
            <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">
              <Flame className="h-3 w-3" />
              Popular
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorited((prev) => !prev);
          }}
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          className={cn(
            "absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center",
            "bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow",
            "transition-all duration-200 hover:scale-110",
            isFavorited
              ? "text-red-500"
              : "text-gray-400 hover:text-red-400 dark:text-gray-500"
          )}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-all",
              isFavorited && "fill-current"
            )}
          />
        </button>

        {/* Delivery time pill */}
        <div className="absolute bottom-3 right-3">
          <span className="inline-flex items-center gap-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-700 dark:text-gray-200 text-xs font-medium px-2 py-0.5 rounded-full shadow">
            <Clock className="h-3 w-3 text-primary" />
            {formatDeliveryTime(deliveryTime)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Name + Verified */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            {restaurant.name}
          </h3>
          {restaurant.isVerified && (
            <BadgeCheck className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
          )}
        </div>

        {/* Cuisine tags */}
        <div className="flex flex-wrap gap-1">
          {(restaurant.cuisineType ?? []).slice(0, 3).map((cuisine) => (
            <span
              key={cuisine}
              className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-700"
            >
              {cuisine}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-50 dark:border-gray-800 pt-2" />

        {/* Rating + Delivery fee */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {ratingDisplay}
            </span>
            <span className="text-gray-400 dark:text-gray-500">
              ({restaurant.totalRatings.toLocaleString()})
            </span>
          </div>

          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <Bike className="h-3.5 w-3.5" />
            <span
              className={cn(
                "text-xs",
                restaurant.deliveryFee === 0
                  ? "text-accent font-medium"
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              {formatDeliveryFee(restaurant.deliveryFee)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
