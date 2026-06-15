import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const partner = await prisma.deliveryPartner.findUnique({ where: { userId: session.user.id } });
  if (!partner) return NextResponse.json({ error: "Not a delivery partner" }, { status: 403 });

  const orders = await prisma.order.findMany({
    where: { status: "PENDING", deliveryPartnerId: null },
    include: {
      restaurant: { select: { name: true, address: true, latitude: true, longitude: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const partner = await prisma.deliveryPartner.findUnique({ where: { userId: session.user.id } });
  if (!partner) return NextResponse.json({ error: "Not a delivery partner" }, { status: 403 });

  const { orderId } = await request.json();

  const order = await prisma.order.findFirst({
    where: { id: orderId, status: "PENDING", deliveryPartnerId: null },
  });

  if (!order) return NextResponse.json({ error: "Order not available" }, { status: 400 });

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      deliveryPartnerId: partner.id,
      status: "ACCEPTED",
      acceptedAt: new Date(),
    },
  });

  await prisma.deliveryPartner.update({
    where: { id: partner.id },
    data: { status: "BUSY" },
  });

  return NextResponse.json(updated);
}
