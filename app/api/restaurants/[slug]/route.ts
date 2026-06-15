import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            menuItems: {
              where: { isAvailable: true },
              orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
            },
          },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            user: { select: { name: true, image: true } },
          },
        },
        _count: { select: { orders: true, reviews: true } },
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("[GET /api/restaurants/[slug]]", error);
    return NextResponse.json({ error: "Failed to fetch restaurant" }, { status: 500 });
  }
}
