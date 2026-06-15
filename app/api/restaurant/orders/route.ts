import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const restaurant = await prisma.restaurant.findFirst({ where: { ownerId: session.user.id } });
  if (!restaurant) return NextResponse.json({ error: "No restaurant found" }, { status: 404 });

  const orders = await prisma.order.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      items: { include: { menuItem: { select: { name: true } } } },
      customer: { select: { name: true, phone: true } },
    },
  });

  return NextResponse.json(orders);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const restaurant = await prisma.restaurant.findFirst({ where: { ownerId: session.user.id } });
  if (!restaurant) return NextResponse.json({ error: "No restaurant found" }, { status: 404 });

  const { orderId, status } = await request.json();

  const allowedTransitions: Record<string, string> = {
    ACCEPTED: "PENDING",
    PREPARING: "ACCEPTED",
    PICKED_UP: "PREPARING",
  };

  const order = await prisma.order.findFirst({
    where: { id: orderId, restaurantId: restaurant.id },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (allowedTransitions[status] !== order.status) {
    return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(status === "ACCEPTED" ? { acceptedAt: new Date() } : {}),
      ...(status === "PREPARING" ? { preparedAt: new Date() } : {}),
    },
  });

  return NextResponse.json(updated);
}
