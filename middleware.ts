import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;
  const returnUrl = encodeURIComponent(pathname);

  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login?returnUrl=${returnUrl}`, request.url));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((session.user as any)?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Customer dashboard routes
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (session.user as any)?.role;
    if (role !== "RESTAURANT_OWNER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Delivery partner routes
  if (pathname.startsWith("/delivery")) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login?returnUrl=${returnUrl}`, request.url));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (session.user as any)?.role;
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
