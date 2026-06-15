import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const returnUrl = encodeURIComponent(pathname);

  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login?returnUrl=${returnUrl}`, request.url));
    }
    const role = (session.user as { role?: string })?.role;
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Authenticated user routes
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login?returnUrl=${returnUrl}`, request.url));
    }
  }

  // Restaurant owner routes
  if (pathname.startsWith("/restaurant-owner")) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login?returnUrl=${returnUrl}`, request.url));
    }
    const role = (session.user as { role?: string })?.role;
    if (role !== "RESTAURANT_OWNER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Delivery partner routes
  if (pathname.startsWith("/delivery")) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login?returnUrl=${returnUrl}`, request.url));
    }
    const role = (session.user as { role?: string })?.role;
    if (role !== "DELIVERY_PARTNER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/restaurant-owner/:path*",
    "/delivery/:path*",
  ],
};
