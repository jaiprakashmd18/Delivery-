"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CheckCircle, ShieldCheck } from "lucide-react";

const benefits = [
  "20% student discount on your first 5 orders",
  "Free delivery on orders above ₾30",
  "Exclusive student rewards program",
  "Priority support for students",
  "Late night delivery available (until 2 AM)",
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45 } },
};

export function StudentBenefitsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 bg-white dark:bg-[#0a0a0a]" ref={ref}>
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* ── Left: content ── */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55 }}
            >
              <span className="badge-green mb-4 inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Student Exclusive
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-5 leading-tight">
                Exclusive{" "}
                <span className="gradient-text">Student Benefits</span>
              </h2>

              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg">
                We built StudentExpress specifically for students. Every feature,
                every discount — designed around your schedule and budget.
              </p>
            </motion.div>

            {/* Benefits list */}
            <motion.ul
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="space-y-4 mb-10"
            >
              {benefits.map((benefit, i) => (
                <motion.li
                  key={i}
                  variants={itemVariants}
                  className="flex items-start gap-3"
                >
                  <CheckCircle
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    style={{ color: "#00C853" }}
                  />
                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {benefit}
                  </span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.55 }}
              className="flex flex-wrap items-center gap-4"
            >
              <button
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95 btn-glow"
                style={{ background: "#FF6B00" }}
              >
                Get Student Access
              </button>

              {/* Verification badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
                style={{
                  background: "rgba(0, 200, 83, 0.1)",
                  color: "#00C853",
                  border: "1px solid rgba(0, 200, 83, 0.25)",
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                .edu email verified
              </div>
            </motion.div>
          </div>

          {/* ── Right: Phone mockup ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Glow behind phone */}
              <div
                className="absolute inset-0 blur-3xl opacity-20 rounded-full"
                style={{ background: "radial-gradient(circle, #FF6B00, transparent)" }}
                aria-hidden="true"
              />

              {/* Phone frame */}
              <div
                className="relative w-[260px] sm:w-[280px] rounded-[40px] overflow-hidden shadow-2xl"
                style={{
                  background: "#111111",
                  padding: "10px",
                  border: "2px solid rgba(255,255,255,0.1)",
                }}
              >
                {/* Notch */}
                <div className="flex justify-center mb-2">
                  <div className="w-20 h-5 bg-black rounded-b-xl" />
                </div>

                {/* Screen content */}
                <div className="rounded-[30px] overflow-hidden bg-gray-50 dark:bg-gray-900">
                  {/* Status bar */}
                  <div className="flex justify-between items-center px-4 py-2 bg-white dark:bg-gray-800">
                    <span className="text-[10px] font-bold text-gray-800 dark:text-white">9:41</span>
                    <span className="text-[10px] text-gray-500">●●●</span>
                  </div>

                  {/* App header */}
                  <div
                    className="px-4 py-3 flex items-center gap-2"
                    style={{ background: "#FF6B00" }}
                  >
                    <span className="text-white text-xs font-bold">StudentExpress</span>
                    <span className="ml-auto text-white text-lg">🎓</span>
                  </div>

                  {/* Order card */}
                  <div className="p-3 space-y-2">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                          style={{ background: "rgba(255,107,0,0.1)" }}
                        >
                          🥟
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-900 dark:text-white">Adjara Kitchen</p>
                          <p className="text-[10px] text-gray-500">2× Khinkali, 1× Lobiani</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">Total</span>
                        <span className="text-[11px] font-bold" style={{ color: "#FF6B00" }}>
                          ₾18.50
                        </span>
                      </div>
                    </div>

                    {/* Map placeholder */}
                    <div
                      className="rounded-xl h-24 flex items-center justify-center relative overflow-hidden"
                      style={{ background: "linear-gradient(135deg, #e8f4fd, #d0e8f5)" }}
                    >
                      {/* Fake map grid */}
                      <div className="absolute inset-0 opacity-30">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="absolute border-t border-blue-300"
                            style={{ top: `${i * 30}%`, width: "100%" }}
                          />
                        ))}
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="absolute border-l border-blue-300"
                            style={{ left: `${i * 30}%`, height: "100%" }}
                          />
                        ))}
                      </div>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg z-10 text-base"
                        style={{ background: "#FF6B00" }}
                      >
                        🛵
                      </div>
                    </div>

                    {/* Delivery status */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                          On the way
                        </span>
                        <span
                          className="text-[10px] font-bold"
                          style={{ color: "#00C853" }}
                        >
                          ~18 min
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full w-3/5"
                          style={{ background: "#FF6B00" }}
                        />
                      </div>
                    </div>

                    {/* Student discount pill */}
                    <div
                      className="rounded-xl px-3 py-2 flex items-center gap-2"
                      style={{
                        background: "rgba(0,200,83,0.1)",
                        border: "1px solid rgba(0,200,83,0.2)",
                      }}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" style={{ color: "#00C853" }} />
                      <span className="text-[10px] font-semibold" style={{ color: "#00C853" }}>
                        20% student discount applied! –₾3.70
                      </span>
                    </div>
                  </div>
                </div>

                {/* Home indicator */}
                <div className="flex justify-center py-2">
                  <div className="w-16 h-1 bg-gray-600 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
