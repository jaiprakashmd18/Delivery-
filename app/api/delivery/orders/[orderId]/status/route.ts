import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_TRANSITIONS: Record<string, string[]> = {
  ACCEPTED: ["PICKED_UP"],
  PREPARING: ["PICKED_UP"],
  PICKED_UP: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const partner = await prisma.deliveryPartner.findUnique({ where: { userId: session.user.id } });
  const isAdmin = (session.user as { role?: string })?.role === "ADMIN";
  if (!partner && !isAdmin) return NextResponse.json({ error: "Not a delivery partner" }, { status: 403 });

  const { orderId } = await params;
  const { status } = await request.json();

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (partner && order.deliveryPartnerId !== partner.id && !isAdmin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const allowed = VALID_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(status)) {
    return NextResponse.json(
      { error: `Cannot transition from ${order.status} to ${status}` },
      { status: 400 }
    );
  }

  const now = new Date();
  const timestamps: Record<string, Date> = {};
  if (status === "PICKED_UP") timestamps.pickedUpAt = now;
  if (status === "OUT_FOR_DELIVERY") timestamps.pickedUpAt = order.pickedUpAt ?? now;
  if (status === "DELIVERED") timestamps.deliveredAt = now;

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status, ...timestamps },
  });

  if (status === "DELIVERED" && partner) {
    await prisma.deliveryPartner.update({
      where: { id: partner.id },
      data: {
        status: "AVAILABLE",
        totalDeliveries: { increment: 1 },
        completedDeliveries: { increment: 1 },
        totalEarnings: { increment: order.deliveryFee },
      },
    });
  }

  await prisma.orderTracking.create({
    data: {
      orderId,
      status,
      message: `Order ${status.toLowerCase().replace(/_/g, " ")} by delivery partner`,
    },
  });

  return NextResponse.json({ success: true, data: updated });
}
