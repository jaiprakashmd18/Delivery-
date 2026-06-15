import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://studentexpress.ge";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    // Core pages
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/menu`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/restaurants`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    // Auth pages
    {
      url: `${BASE_URL}/auth/sign-in`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/auth/sign-up`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/auth/forgot-password`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    // User account pages (lower priority — require auth)
    {
      url: `${BASE_URL}/dashboard`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/dashboard/orders`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/dashboard/profile`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/dashboard/addresses`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/dashboard/favorites`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.4,
    },
    // Checkout flow
    {
      url: `${BASE_URL}/cart`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/checkout`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // Admin pages (lowest priority for public crawlers)
    {
      url: `${BASE_URL}/admin`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.2,
    },
    // Static / informational pages
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    // Partner / vendor pages
    {
      url: `${BASE_URL}/become-a-partner`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
