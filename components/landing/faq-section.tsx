"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How does StudentExpress Georgia work?",
    a: "Simply browse restaurants, add items to your cart, choose your delivery address, and place your order. Our verified delivery partners pick up from the restaurant and bring it to you. Track your order live every step of the way.",
  },
  {
    q: "What areas do you deliver to?",
    a: "We currently operate in Tbilisi, Georgia, covering all major districts including Vake, Saburtalo, Isani, Nadzaladevi, Didube, and more. We're rapidly expanding to other cities in Georgia.",
  },
  {
    q: "How does the Personal Pickup service work?",
    a: "Can't find your favourite restaurant on our app? No problem! Submit a pickup request with the restaurant name, address, and what you want to order (including a screenshot of the menu). We'll pick it up and deliver it to you for a small fee.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Cash on Delivery, Card Payment (Visa/Mastercard), and Bank Transfer. You can also pay using your StudentExpress Wallet balance for a faster checkout experience.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order is placed, you'll receive a tracking link via SMS and email. You can also track your order in real-time from your dashboard. We'll notify you at every stage — from order acceptance to delivery at your door.",
  },
  {
    q: "Is there a student discount?",
    a: "Yes! Verified students get 20% off their first 5 orders. We also have a Student Membership program with exclusive perks including free delivery on orders above ₾30, priority support, and monthly cashback offers.",
  },
];

export function FAQSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about StudentExpress Georgia.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card rounded-xl border border-border px-6"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline hover:text-primary">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
