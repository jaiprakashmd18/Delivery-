"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Star, Clock, Truck, MapPin, Phone, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuItemCard } from "@/components/restaurant/menu-item-card";
import { ReviewCard } from "@/components/restaurant/review-card";
import { CartSidebar } from "@/components/restaurant/cart-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

interface Props {
  slug: string;
}

export function RestaurantDetail({ slug }: Props) {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/restaurants/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setRestaurant(data);
        if (data?.categories?.length > 0) {
          setActiveCategory(data.categories[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Skeleton className="h-64 w-full rounded-2xl mb-6" />
        <Skeleton className="h-8 w-64 mb-3" />
        <Skeleton className="h-4 w-48 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-bold">Restaurant not found</h2>
        <Link href="/restaurants">
          <Button>Browse Restaurants</Button>
        </Link>
      </div>
    );
  }

  const activeItems = activeCategory
    ? restaurant.categories?.find((c: any) => c.id === activeCategory)?.menuItems ?? []
    : restaurant.categories?.[0]?.menuItems ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Link href="/restaurants" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ChevronLeft className="w-4 h-4" /> Back to restaurants
      </Link>

      {/* Cover Image */}
      <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden mb-6 bg-muted">
        {restaurant.coverImage ? (
          <Image src={restaurant.coverImage} alt={restaurant.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 flex items-center justify-center">
            <span className="text-6xl">🍽️</span>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Restaurant Info */}
          <div className="mb-6">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{restaurant.name}</h1>
                <p className="text-muted-foreground mt-1">{restaurant.description}</p>
              </div>
              {restaurant.isVerified && (
                <Badge className="bg-accent/10 text-accent border-accent/20">✓ Verified</Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({restaurant.totalRatings} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {restaurant.avgDeliveryTime} min
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Truck className="w-4 h-4" />
                Delivery: {formatPrice(restaurant.deliveryFee)}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {restaurant.address}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="menu">
            <TabsList className="mb-6 w-full sm:w-auto">
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>

            <TabsContent value="menu">
              {/* Category selector */}
              {restaurant.categories && restaurant.categories.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
                  {restaurant.categories.map((cat: any) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeCategory === cat.id
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="grid gap-4">
                {activeItems.map((item: any) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    restaurantId={restaurant.id}
                    restaurantName={restaurant.name}
                  />
                ))}
                {activeItems.length === 0 && (
                  <p className="text-muted-foreground text-center py-10">
                    No items in this category yet.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="space-y-4">
                {restaurant.reviews?.length > 0 ? (
                  restaurant.reviews.map((review: any) => (
                    <ReviewCard key={review.id} review={review} />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-10">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="info">
              <div className="space-y-4">
                <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                  <h3 className="font-semibold">Contact & Location</h3>
                  {restaurant.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-primary" />
                      <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary mt-0.5" />
                    <span>{restaurant.address}, {restaurant.city}</span>
                  </div>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <h3 className="font-semibold mb-3">Delivery Info</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Delivery Fee</span><p className="font-medium">{formatPrice(restaurant.deliveryFee)}</p></div>
                    <div><span className="text-muted-foreground">Min. Order</span><p className="font-medium">{formatPrice(restaurant.minOrderAmount)}</p></div>
                    <div><span className="text-muted-foreground">Avg. Time</span><p className="font-medium">{restaurant.avgDeliveryTime} min</p></div>
                    <div><span className="text-muted-foreground">Delivery Radius</span><p className="font-medium">{restaurant.deliveryRadius} km</p></div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Cart Sidebar - Desktop */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-20">
            <CartSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
