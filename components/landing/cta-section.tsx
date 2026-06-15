"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary via-orange-500 to-orange-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-white rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/20 text-white rounded-full px-4 py-2 text-sm font-medium mb-6">
            <Smartphone className="w-4 h-4" />
            Available on iOS & Android
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Order?
          </h2>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto mb-10">
            Join 10,000+ students already using StudentExpress Georgia for fast,
            reliable deliveries across the city.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-orange-50 font-semibold px-8 h-14 text-base shadow-xl"
              >
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/restaurants">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 h-14 text-base"
              >
                Browse Restaurants
              </Button>
            </Link>
          </div>
          <p className="text-orange-200 text-sm mt-6">
            No credit card required · Free delivery on first order
          </p>
        </motion.div>
      </div>
    </section>
  );
}
