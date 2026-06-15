import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { PopularRestaurantsSection } from "@/components/landing/popular-restaurants-section";
import { StudentBenefitsSection } from "@/components/landing/student-benefits-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FAQSection } from "@/components/landing/faq-section";
import { CTASection } from "@/components/landing/cta-section";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "StudentExpress Georgia - Food Delivery for Students",
  description:
    "Order food from restaurants, request personal pickups, groceries, and parcels all in one place. The #1 delivery platform for students in Georgia.",
  openGraph: {
    title: "StudentExpress Georgia",
    description: "Food Delivery Made Easy For Students In Georgia",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PopularRestaurantsSection />
        <StudentBenefitsSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
