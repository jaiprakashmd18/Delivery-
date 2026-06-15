"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Search, MapPin, ArrowRight, Smartphone } from "lucide-react";

const stats = [
  { label: "Restaurants", value: "500+" },
  { label: "Students", value: "10,000+" },
  { label: "Avg Delivery", value: "30 Min" },
];

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [searchValue, setSearchValue] = useState("");

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden bg-white dark:bg-[#0a0a0a]"
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #FF6B00, transparent)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #00C853, transparent)" }}
        />
        <div className="absolute inset-0 bg-dots opacity-60" />
      </div>

      <div className="section-container relative z-10 pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <span className="badge-orange mb-4 inline-block">
                🇬🇪 #1 Student Delivery in Georgia
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6"
            >
              Food Delivery{" "}
              <span className="gradient-text">Made Easy</span>
              {" "}For Students In Georgia
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl"
            >
              Order from restaurants, request personal pickups, groceries, and
              parcels all in one place. Student discounts included.
            </motion.p>

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative mb-8 max-w-lg"
            >
              <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg overflow-hidden">
                <MapPin className="ml-4 w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search restaurants or cuisine..."
                  className="flex-1 px-3 py-4 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                />
                <button
                  className="m-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "#FF6B00" }}
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <Link
                href="/order"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95 btn-glow"
                style={{ background: "#FF6B00" }}
              >
                Order Food
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pickup"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm border-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-900 active:scale-95"
                style={{ borderColor: "#FF6B00", color: "#FF6B00" }}
              >
                Request Pickup
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-8"
            >
              {stats.map((stat, i) => (
                <div key={i}>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* App badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center gap-4 mt-8"
            >
              <Smartphone className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Download the app:</span>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-800 text-white rounded-xl text-xs font-medium cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  App Store
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-800 text-white rounded-xl text-xs font-medium cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.18 23.76a2 2 0 01-.91-1.69V1.93a2 2 0 01.91-1.69l.09-.05L13.5 12l-10.23 11.8-.09-.04zM16.54 8.69L5.08 2.03l9.67 9.67-9.67 9.67L16.54 15.3l2.17-3.3-2.17-3.31zM20.27 10.3c.51.29.86.8.86 1.44 0 .63-.34 1.14-.86 1.43l-1.73 1-.2.12-2.27-2.27.28-.28 1.97 1.97 1.95-1.42z"/>
                  </svg>
                  Google Play
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Visual */}
          <div className="relative hidden lg:flex items-center justify-center">
            {/* Hero illustration container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              {/* Main circle background */}
              <div
                className="w-[420px] h-[420px] rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(255,107,0,0.12) 0%, rgba(255,107,0,0.04) 100%)",
                  border: "1px solid rgba(255,107,0,0.15)",
                }}
              >
                <div className="text-[160px] select-none">🍕</div>
              </div>

              {/* Floating order card */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-12 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 w-52 border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: "rgba(255,107,0,0.1)" }}
                  >
                    🍔
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">Burger Hub</p>
                    <p className="text-xs text-gray-500">Fast Food</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Arriving in</span>
                  <span className="text-xs font-bold" style={{ color: "#FF6B00" }}>22 min</span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full w-2/3"
                    style={{ background: "#FF6B00" }}
                  />
                </div>
              </motion.div>

              {/* Floating rating card */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -top-4 -right-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-3 border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">4.9</p>
                    <p className="text-xs text-gray-500">Rating</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating discount badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 -right-16 -translate-y-1/2 rounded-2xl shadow-xl p-3 text-white"
                style={{ background: "#00C853" }}
              >
                <p className="text-xs font-bold">Student</p>
                <p className="text-lg font-extrabold">20% OFF</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
