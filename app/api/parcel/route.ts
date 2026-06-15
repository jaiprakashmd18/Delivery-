import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

const SIZE_FEE: Record<string, number> = { small: 3, medium: 5, large: 8 };

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const {
      pickupAddress, dropAddress, parcelType, parcelSize, parcelWeight,
      parcelDescription, isFragile, receiverName, receiverPhone, notes,
    } = body;

    if (!pickupAddress || !dropAddress || !parcelType || !parcelSize || !receiverName || !receiverPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const baseFee = SIZE_FEE[parcelSize] ?? 5;
    const fragileSurcharge = isFragile ? 2 : 0;
    const estimatedFee = baseFee + fragileSurcharge;
    const estimatedTime = 45;
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: session.user.id,
        type: "PARCEL",
        status: "PENDING",
        subtotal: 0,
        deliveryFee: estimatedFee,
        tax: 0,
        discount: 0,
        total: estimatedFee,
        paymentMethod: "CASH_ON_DELIVERY",
        paymentStatus: "PENDING",
        deliveryAddress: dropAddress,
        pickupRestaurantAddress: pickupAddress,
        parcelDescription: `${parcelType} | ${parcelSize} | ${parcelWeight}${isFragile ? " | FRAGILE" : ""}`,
        receiverName,
        receiverPhone,
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
    console.error("[POST /api/parcel]", error);
    return NextResponse.json({ error: "Failed to create parcel request" }, { status: 500 });
  }
}
