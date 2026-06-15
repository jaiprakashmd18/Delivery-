import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RestaurantDetail } from "@/components/restaurant/restaurant-detail";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, " ")} | StudentExpress Georgia`,
    description: "Order food online with fast delivery.",
  };
}

export default async function RestaurantPage({ params }: Props) {
  const { slug } = await params;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <RestaurantDetail slug={slug} />
      </main>
      <Footer />
    </>
  );
}
