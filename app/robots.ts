import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://studentexpress.ge";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Allow all well-behaved crawlers
      {
        userAgent: "*",
        allow: ["/", "/menu", "/restaurants", "/about", "/contact", "/faq"],
        disallow: [
          "/dashboard/",
          "/admin/",
          "/checkout/",
          "/cart/",
          "/api/",
          "/_next/",
          "/auth/",
          "/verify-email/",
          "/reset-password/",
          "/*.json$",
        ],
      },
      // Block bad bots
      {
        userAgent: [
          "AhrefsBot",
          "SemrushBot",
          "DotBot",
          "MJ12bot",
          "BLEXBot",
          "DataForSeoBot",
        ],
        disallow: ["/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
