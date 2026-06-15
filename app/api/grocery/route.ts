import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { storeId, items, deliveryAddress, deliveryTime, notes } = body;

    if (!storeId || !items?.length || !deliveryAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const estimatedFee = 4.0;
    const estimatedTime = 75;
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: session.user.id,
        type: "GROCERY",
        status: "PENDING",
        subtotal: 0,
        deliveryFee: estimatedFee,
        tax: 0,
        discount: 0,
        total: estimatedFee,
        paymentMethod: "CASH_ON_DELIVERY",
        paymentStatus: "PENDING",
        deliveryAddress,
        foodDescription: JSON.stringify(items),
        notes: notes || null,
        estimatedDeliveryTime: estimatedTime,
      },
    });

    return NextResponse.json({
      orderNumber: order.orderNumber,
      orderId: order.id,
      estimatedFee,
      estimatedTime,
    }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/grocery]", error);
    return NextResponse.json({ error: "Failed to create grocery order" }, { status: 500 });
  }
}
