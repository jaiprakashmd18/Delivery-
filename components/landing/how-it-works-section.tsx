"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ShoppingBag, Truck, MapPin } from "lucide-react";

interface Step {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
}

const steps: Step[] = [
  {
    number: "01",
    icon: <ShoppingBag className="w-7 h-7" />,
    title: "Choose Your Order",
    description:
      "Browse 500+ restaurants on our app or website. Can't find what you want? Submit a personal pickup request and we'll get it from anywhere in the city.",
    iconBg: "rgba(255, 107, 0, 0.12)",
    iconColor: "#FF6B00",
  },
  {
    number: "02",
    icon: <Truck className="w-7 h-7" />,
    title: "We Deliver",
    description:
      "Our verified delivery partners pick up your order and head straight to you. Real-time updates keep you informed every step of the way.",
    iconBg: "rgba(0, 200, 83, 0.12)",
    iconColor: "#00C853",
  },
  {
    number: "03",
    icon: <MapPin className="w-7 h-7" />,
    title: "Enjoy & Track",
    description:
      "Track your courier live on the map until your order arrives. Rate your experience and earn rewards with every delivery.",
    iconBg: "rgba(255, 107, 0, 0.12)",
    iconColor: "#FF6B00",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.18 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 bg-white dark:bg-[#0a0a0a]" ref={ref}>
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="badge-orange mb-4 inline-block">Simple Process</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            How It{" "}
            <span className="gradient-text">Works</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Getting food delivered to your campus has never been easier. Three simple steps and your meal is on the way.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="relative"
        >
          {/* Connecting dashed line — desktop only */}
          <div
            className="hidden lg:block absolute top-[52px] left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-px"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, #FF6B00 0, #FF6B00 8px, transparent 8px, transparent 20px)",
              opacity: 0.35,
            }}
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex flex-col items-center text-center lg:items-center"
              >
                {/* Number + Icon stack */}
                <div className="relative mb-6">
                  {/* Outer ring */}
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center"
                    style={{
                      background: step.iconBg,
                      border: `2px solid ${step.iconColor}22`,
                    }}
                  >
                    <div style={{ color: step.iconColor }}>{step.icon}</div>
                  </div>

                  {/* Number badge */}
                  <div
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold text-white shadow-md"
                    style={{ background: step.iconColor }}
                  >
                    {index + 1}
                  </div>
                </div>

                {/* Step label */}
                <span
                  className="text-xs font-bold tracking-widest uppercase mb-2"
                  style={{ color: step.iconColor }}
                >
                  Step {step.number}
                </span>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA hint */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Average delivery time:{" "}
            <span className="font-bold" style={{ color: "#FF6B00" }}>
              under 30 minutes
            </span>{" "}
            across Tbilisi
          </p>
        </motion.div>
      </div>
    </section>
  );
}
