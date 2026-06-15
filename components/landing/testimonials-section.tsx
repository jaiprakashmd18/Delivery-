"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  name: string;
  university: string;
  review: string;
  initial: string;
  avatarBg: string;
  avatarColor: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Nino Kvaratskhelia",
    university: "Tbilisi State University",
    review:
      "StudentExpress has completely changed how I eat during exam season. Fast delivery and the student discount is amazing! I save so much compared to ordering elsewhere.",
    initial: "N",
    avatarBg: "rgba(255, 107, 0, 0.15)",
    avatarColor: "#FF6B00",
  },
  {
    name: "Giorgi Beridze",
    university: "Georgian Technical University",
    review:
      "The personal pickup feature is genius. I can get food from any restaurant in the city, not just listed ones. My favorite khinkali place isn't on any other platform but I can still order it!",
    initial: "G",
    avatarBg: "rgba(0, 200, 83, 0.15)",
    avatarColor: "#00C853",
  },
  {
    name: "Mariam Jgarkava",
    university: "Free University of Tbilisi",
    review:
      "Late night delivery is a lifesaver! When I'm studying until midnight, I can still get fresh food delivered. The live tracking on the map makes me feel safe knowing exactly where my order is.",
    initial: "M",
    avatarBg: "rgba(255, 107, 0, 0.15)",
    avatarColor: "#FF6B00",
  },
];

function StarRow() {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export function TestimonialsSection() {
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
          className="text-center mb-16"
        >
          <span className="badge-orange mb-4 inline-block">Student Stories</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            What Students{" "}
            <span className="gradient-text">Are Saying</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Over 10,000 students across Georgia trust StudentExpress for their daily food delivery needs.
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 card-hover"
            >
              {/* Quote icon */}
              <div className="absolute top-5 right-5">
                <Quote
                  className="w-8 h-8 opacity-10"
                  style={{ color: "#FF6B00" }}
                />
              </div>

              {/* Stars */}
              <StarRow />

              {/* Review text */}
              <p className="mt-4 mb-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                &ldquo;{t.review}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
                  style={{
                    background: t.avatarBg,
                    color: t.avatarColor,
                    border: `2px solid ${t.avatarColor}30`,
                  }}
                >
                  {t.initial}
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.university}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6"
        >
          {[
            { value: "4.9/5", label: "Average Rating" },
            { value: "10,000+", label: "Active Students" },
            { value: "98%", label: "Satisfaction Rate" },
            { value: "500+", label: "Restaurants" },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center py-5 px-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800"
            >
              <p
                className="text-2xl font-extrabold mb-1"
                style={{ color: "#FF6B00" }}
              >
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
