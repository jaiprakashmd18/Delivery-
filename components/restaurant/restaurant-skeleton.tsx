import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
    />
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      {/* Cover image */}
      <Skeleton className="h-48 w-full rounded-none" />

      <div className="p-4 space-y-3">
        {/* Name */}
        <Skeleton className="h-5 w-3/4" />
        {/* Cuisine tags */}
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        {/* Rating + reviews */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
        {/* Delivery info */}
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function RestaurantGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <RestaurantCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function MenuItemSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <Skeleton className="h-24 w-24 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function RestaurantDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <Skeleton className="h-64 md:h-80 w-full rounded-none" />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Restaurant info */}
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>

        {/* Menu items */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <MenuItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
