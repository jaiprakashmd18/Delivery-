import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RestaurantGrid } from "@/components/restaurant/restaurant-grid";
import { RestaurantFilters } from "@/components/restaurant/restaurant-filters";
import { RestaurantGridSkeleton } from "@/components/restaurant/restaurant-skeleton";

export const metadata = {
  title: "Restaurants | StudentExpress Georgia",
  description: "Browse 500+ restaurants in Tbilisi and order food delivered to your door.",
};

export default function RestaurantsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <div className="bg-gradient-to-b from-orange-50 to-background dark:from-gray-900 dark:to-background py-10">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Order Food in Tbilisi
            </h1>
            <p className="text-muted-foreground mb-8">
              Discover the best restaurants near you
            </p>
            <RestaurantFilters />
          </div>
        </div>
        <div className="container mx-auto px-4 py-10">
          <Suspense fallback={<RestaurantGridSkeleton count={6} />}>
            <RestaurantGrid />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
