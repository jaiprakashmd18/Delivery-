import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "relevance";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "12"), 50);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  try {
    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const orderBy =
      sort === "rating"
        ? { rating: "desc" as const }
        : sort === "delivery_time"
        ? { avgDeliveryTime: "asc" as const }
        : sort === "price"
        ? { deliveryFee: "asc" as const }
        : { isFeatured: "desc" as const };

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        orderBy: [{ isFeatured: "desc" }, orderBy],
        take: limit,
        skip: offset,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
          coverImage: true,
          address: true,
          city: true,
          deliveryFee: true,
          minOrderAmount: true,
          avgDeliveryTime: true,
          rating: true,
          totalRatings: true,
          isVerified: true,
          isFeatured: true,
          categories: { select: { name: true }, take: 3 },
        },
      }),
      prisma.restaurant.count({ where }),
    ]);

    return NextResponse.json({
      data: restaurants,
      total,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[GET /api/restaurants]", error);
    return NextResponse.json({ error: "Failed to fetch restaurants" }, { status: 500 });
  }
}
