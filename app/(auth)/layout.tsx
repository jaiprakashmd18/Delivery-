export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: {
    template: "%s | StudentExpress Georgia",
    default: "StudentExpress Georgia",
  },
  description:
    "Fast, affordable food delivery for students across Georgia. Order from campus restaurants and get it delivered to your dorm.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Minimal header */}
      <header className="w-full px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 group"
            aria-label="StudentExpress Georgia Home"
          >
            <div className="w-9 h-9 bg-[#FF6B00] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-orange-300 dark:group-hover:shadow-orange-900 transition-shadow duration-200">
              <ShoppingBag className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-[#FF6B00] leading-none block">
                StudentExpress
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">
                Georgia
              </span>
            </div>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Decorative background blobs */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 overflow-hidden -z-10"
          >
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FF6B00]/10 dark:bg-[#FF6B00]/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#00C853]/10 dark:bg-[#00C853]/5 rounded-full blur-3xl" />
          </div>

          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-600">
          © {new Date().getFullYear()} StudentExpress Georgia. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
