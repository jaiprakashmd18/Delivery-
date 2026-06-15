export const dynamic = "force-dynamic";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StudentExpress Georgia — Food Delivery Made Easy For Students",
    template: "%s | StudentExpress Georgia",
  },
  description:
    "StudentExpress Georgia is the fastest food delivery platform built exclusively for students in Georgia. Order from top campus restaurants and get meals delivered right to your dorm.",
  keywords: [
    "food delivery",
    "student food delivery",
    "Georgia food delivery",
    "campus delivery",
    "StudentExpress",
    "student express georgia",
    "university food",
    "college delivery",
    "Tbilisi food delivery",
    "Georgia university meals",
  ],
  authors: [{ name: "StudentExpress Georgia", url: "https://studentexpress.ge" }],
  creator: "StudentExpress Georgia",
  publisher: "StudentExpress Georgia",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://studentexpress.ge"
  ),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en",
      "ka-GE": "/ka",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://studentexpress.ge",
    siteName: "StudentExpress Georgia",
    title: "StudentExpress Georgia — Food Delivery Made Easy For Students",
    description:
      "The fastest food delivery platform built exclusively for students in Georgia. Order from top campus restaurants and get meals delivered right to your dorm.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "StudentExpress Georgia — Food Delivery For Students",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@studentexpressge",
    creator: "@studentexpressge",
    title: "StudentExpress Georgia — Food Delivery Made Easy For Students",
    description:
      "The fastest food delivery platform built exclusively for students in Georgia. Order from top campus restaurants and get meals delivered right to your dorm.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
  category: "food delivery",
  applicationName: "StudentExpress Georgia",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FF6B00" },
    { media: "(prefers-color-scheme: dark)", color: "#FF6B00" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="StudentExpress" />
        <meta name="msapplication-TileColor" content="#FF6B00" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
            <Toaster
              position="bottom-right"
              expand={false}
              richColors
              closeButton
              toastOptions={{
                style: {
                  borderRadius: "var(--radius)",
                },
                classNames: {
                  toast: "font-sans",
                  success: "border-[#00C853]/20",
                  error: "border-destructive/20",
                },
              }}
            />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
