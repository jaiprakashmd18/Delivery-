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
    const { restaurantName, restaurantAddress, foodDescription, screenshotUrl, deliveryAddress, phone, notes } = body;

    if (!restaurantName || !restaurantAddress || !foodDescription || !deliveryAddress || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const estimatedFee = 5.0;
    const estimatedTime = 60;
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: session.user.id,
        type: "PERSONAL_PICKUP",
        status: "PENDING",
        subtotal: 0,
        deliveryFee: estimatedFee,
        tax: 0,
        discount: 0,
        total: estimatedFee,
        paymentMethod: "CASH_ON_DELIVERY",
        paymentStatus: "PENDING",
        deliveryAddress,
        pickupRestaurantName: restaurantName,
        pickupRestaurantAddress: restaurantAddress,
        foodDescription,
        screenshotUrl: screenshotUrl || null,
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
    console.error("[POST /api/pickup]", error);
    return NextResponse.json({ error: "Failed to create pickup request" }, { status: 500 });
  }
}
