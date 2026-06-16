import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const partner = await prisma.deliveryPartner.findUnique({ where: { userId: session.user.id } });
  const isAdmin = (session.user as { role?: string })?.role === "ADMIN";
  if (!partner && !isAdmin) return NextResponse.json({ error: "Not a delivery partner" }, { status: 403 });

  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      restaurant: { select: { id: true, name: true, address: true, latitude: true, longitude: true } },
      customer: { select: { id: true, name: true, phone: true } },
      items: {
        include: { menuItem: { select: { id: true, name: true, image: true } } },
      },
      deliveryPartner: { include: { user: { select: { name: true, phone: true } } } },
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (partner && order.deliveryPartnerId && order.deliveryPartnerId !== partner.id && !isAdmin) {
    return NextResponse.json({ error: "Not authorized to view this order" }, { status: 403 });
  }

  return NextResponse.json({ data: order });
}
