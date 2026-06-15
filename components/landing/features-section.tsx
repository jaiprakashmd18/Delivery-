"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, UtensilsCrossed, ShoppingBag, ShoppingCart, Package, MapPin } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Zap className="w-6 h-6" />,
    iconBg: "rgba(255, 107, 0, 0.1)",
    iconColor: "#FF6B00",
    title: "Fast Delivery",
    description: "Average 30 min delivery to your location. We know students can't wait.",
  },
  {
    icon: <UtensilsCrossed className="w-6 h-6" />,
    iconBg: "rgba(255, 107, 0, 0.1)",
    iconColor: "#FF6B00",
    title: "Restaurant Selection",
    description: "500+ restaurants across Georgia. From Georgian khinkali to international cuisine.",
  },
  {
    icon: <ShoppingBag className="w-6 h-6" />,
    iconBg: "rgba(0, 200, 83, 0.1)",
    iconColor: "#00C853",
    title: "Personal Pickup",
    description: "We pick up from any restaurant, even ones not listed on our platform.",
  },
  {
    icon: <ShoppingCart className="w-6 h-6" />,
    iconBg: "rgba(0, 200, 83, 0.1)",
    iconColor: "#00C853",
    title: "Grocery Delivery",
    description: "Fresh groceries delivered to your door. Perfect for student apartments.",
  },
  {
    icon: <Package className="w-6 h-6" />,
    iconBg: "rgba(255, 107, 0, 0.1)",
    iconColor: "#FF6B00",
    title: "Parcel Delivery",
    description: "Send parcels anywhere in the city quickly and reliably.",
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    iconBg: "rgba(0, 200, 83, 0.1)",
    iconColor: "#00C853",
    title: "Live Tracking",
    description: "Track your order in real-time. See exactly where your courier is.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-950" ref={ref}>
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="badge-orange mb-4 inline-block">Everything You Need</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            One App,{" "}
            <span className="gradient-text">All Deliveries</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            From food to groceries to parcels — StudentExpress handles it all so you can focus on what matters: your studies.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 card-hover cursor-default"
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: feature.iconBg,
                  color: feature.iconColor,
                }}
              >
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
