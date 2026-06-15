"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  SlidersHorizontal,
  Leaf,
  Coffee,
  UtensilsCrossed,
  Pizza,
  IceCream2,
  GlassWater,
  Soup,
  Flame,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CuisineCategory, SortOption } from "@/types";

const CATEGORIES: { label: CuisineCategory; icon: React.ReactNode }[] = [
  { label: "All", icon: <UtensilsCrossed className="h-4 w-4" /> },
  { label: "Indian", icon: <Flame className="h-4 w-4" /> },
  { label: "Chinese", icon: <Soup className="h-4 w-4" /> },
  { label: "Georgian", icon: <Leaf className="h-4 w-4" /> },
  { label: "Fast Food", icon: <Pizza className="h-4 w-4" /> },
  { label: "Desserts", icon: <IceCream2 className="h-4 w-4" /> },
  { label: "Beverages", icon: <GlassWater className="h-4 w-4" /> },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "rating", label: "Rating" },
  { value: "delivery_time", label: "Delivery Time" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
];

const RATING_OPTIONS = [
  { value: 0, label: "All" },
  { value: 3, label: "3+ ★" },
  { value: 4, label: "4+ ★" },
  { value: 4.5, label: "4.5+ ★" },
];

interface RestaurantFiltersProps {
  onFiltersChange?: (filters: {
    category: CuisineCategory;
    sort: SortOption;
    minRating: number;
    maxDeliveryFee: number;
    openNow: boolean;
  }) => void;
}

export function RestaurantFilters({ onFiltersChange }: RestaurantFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeCategory = (searchParams.get("category") as CuisineCategory) ?? "All";
  const activeSort = (searchParams.get("sort") as SortOption) ?? "relevance";
  const activeRating = Number(searchParams.get("rating") ?? 0);
  const maxFee = Number(searchParams.get("maxFee") ?? 20);
  const openNow = searchParams.get("openNow") === "true";

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "" || value === "0" || value === "All" || value === "relevance") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Reset pagination when filters change
    params.delete("page");
    startTransition(() => {
      router.push(`/restaurants?${params.toString()}`, { scroll: false });
    });
  }

  const hasActiveFilters =
    activeCategory !== "All" ||
    activeSort !== "relevance" ||
    activeRating > 0 ||
    openNow;

  function clearAll() {
    startTransition(() => {
      router.push("/restaurants", { scroll: false });
    });
  }

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
        {CATEGORIES.map(({ label, icon }) => (
          <button
            key={label}
            onClick={() => updateParam("category", label)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap snap-start",
              "transition-all duration-200 border",
              activeCategory === label
                ? "bg-primary text-white border-primary shadow-glow scale-105"
                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700",
              "hover:border-primary hover:text-primary dark:hover:text-primary",
              isPending && "opacity-60 cursor-wait"
            )}
          >
            <span
              className={cn(
                activeCategory === label
                  ? "text-white"
                  : "text-gray-400 dark:text-gray-500"
              )}
            >
              {icon}
            </span>
            {label}
          </button>
        ))}
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={activeSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className={cn(
              "appearance-none pl-3 pr-8 py-2 rounded-xl text-sm font-medium",
              "border border-gray-200 dark:border-gray-700",
              "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200",
              "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
              "cursor-pointer transition-colors",
              isPending && "opacity-60"
            )}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Advanced filters toggle */}
        <button
          onClick={() => setShowAdvanced((v) => !v)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium",
            "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900",
            "text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary",
            "transition-all duration-200",
            showAdvanced && "border-primary text-primary"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="h-2 w-2 rounded-full bg-primary" />
          )}
        </button>

        {/* Open Now toggle */}
        <button
          onClick={() => updateParam("openNow", openNow ? null : "true")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium",
            "border transition-all duration-200",
            openNow
              ? "bg-accent/10 border-accent text-accent"
              : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300",
            "hover:border-accent hover:text-accent"
          )}
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              openNow ? "bg-accent" : "bg-gray-300 dark:bg-gray-600"
            )}
          />
          Open Now
        </button>

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}

        {isPending && (
          <span className="text-xs text-gray-400 dark:text-gray-500 animate-pulse">
            Updating...
          </span>
        )}
      </div>

      {/* Advanced filters panel */}
      {showAdvanced && (
        <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-5 shadow-sm">
          {/* Rating filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Rating
            </label>
            <div className="flex gap-2 flex-wrap">
              {RATING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    updateParam("rating", opt.value > 0 ? String(opt.value) : null)
                  }
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                    activeRating === opt.value
                      ? "bg-primary text-white border-primary"
                      : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Max delivery fee slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Max Delivery Fee
              </label>
              <span className="text-sm font-semibold text-primary">
                {maxFee === 20 ? "Any" : `₾${maxFee}`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={maxFee}
              onChange={(e) =>
                updateParam(
                  "maxFee",
                  e.target.value === "20" ? null : e.target.value
                )
              }
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary bg-gray-200 dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Free</span>
              <span>₾20</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
