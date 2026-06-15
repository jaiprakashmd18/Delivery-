"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, Clock, ArrowRight } from "lucide-react";
import Image from "next/image";

interface Restaurant {
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  emoji: string;
  imageUrl: string;
  bgColor: string;
}

const restaurants: Restaurant[] = [
  {
    name: "Adjara Kitchen",
    cuisine: "Georgian",
    rating: 4.8,
    deliveryTime: "25 min",
    deliveryFee: "₾2",
    emoji: "🥟",
    imageUrl:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=250&fit=crop",
    bgColor: "#FFF3E8",
  },
  {
    name: "Spice Route",
    cuisine: "Indian",
    rating: 4.6,
    deliveryTime: "35 min",
    deliveryFee: "₾3",
    emoji: "🍛",
    imageUrl:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=250&fit=crop",
    bgColor: "#FFF8E1",
  },
  {
    name: "Dragon Palace",
    cuisine: "Chinese",
    rating: 4.5,
    deliveryTime: "30 min",
    deliveryFee: "₾2",
    emoji: "🍜",
    imageUrl:
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=250&fit=crop",
    bgColor: "#FCE4EC",
  },
  {
    name: "Bella Roma",
    cuisine: "Italian",
    rating: 4.7,
    deliveryTime: "40 min",
    deliveryFee: "₾4",
    emoji: "🍕",
    imageUrl:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=250&fit=crop",
    bgColor: "#E8F5E9",
  },
  {
    name: "Burger Hub",
    cuisine: "Fast Food",
    rating: 4.4,
    deliveryTime: "20 min",
    deliveryFee: "₾1.50",
    emoji: "🍔",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=250&fit=crop",
    bgColor: "#E3F2FD",
  },
  {
    name: "Sweet Dreams",
    cuisine: "Desserts",
    rating: 4.9,
    deliveryTime: "25 min",
    deliveryFee: "₾2.50",
    emoji: "🍰",
    imageUrl:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=250&fit=crop",
    bgColor: "#F3E5F5",
  },
];

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className="w-3.5 h-3.5"
          style={{
            fill: i < full || (i === full && half) ? "#FBBF24" : "none",
            color: i < full || (i === full && half) ? "#FBBF24" : "#D1D5DB",
          }}
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
        {rating}
      </span>
    </div>
  );
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function PopularRestaurantsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-950" ref={ref}>
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4"
        >
          <div>
            <span className="badge-orange mb-4 inline-block">Top Picks</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Popular{" "}
              <span className="gradient-text">Restaurants</span>
            </h2>
          </div>
          <button
            className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ color: "#FF6B00" }}
          >
            View All Restaurants
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Restaurant grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {restaurants.map((restaurant, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 transition-shadow duration-300 cursor-pointer"
            >
              {/* Image / placeholder */}
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  onError={undefined}
                />
                {/* Fallback emoji overlay for failed images */}
                <div
                  className="absolute inset-0 flex items-center justify-center text-5xl opacity-0"
                  aria-hidden="true"
                  style={{ background: restaurant.bgColor }}
                >
                  {restaurant.emoji}
                </div>

                {/* Cuisine badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 backdrop-blur-sm">
                    {restaurant.cuisine}
                  </span>
                </div>
              </div>

              {/* Card content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-[#FF6B00] transition-colors">
                    {restaurant.name}
                  </h3>
                  <span className="text-lg">{restaurant.emoji}</span>
                </div>

                <StarRating rating={restaurant.rating} />

                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Delivery:</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {restaurant.deliveryFee}
                    </span>
                  </div>
                </div>

                <button
                  className="mt-4 w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90"
                  style={{ background: "#FF6B00" }}
                >
                  Order Now
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
