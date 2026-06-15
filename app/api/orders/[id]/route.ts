import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const order = await prisma.order.findFirst({
      where: {
        id,
        customerId: session.user.id,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            image: true,
            phone: true,
            address: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: { name: true, image: true, price: true },
            },
          },
        },
        address: true,
        trackingUpdates: {
          orderBy: { createdAt: 'asc' },
        },
        deliveryPartner: {
          select: {
            id: true,
            userId: true,
            vehicleType: true,
            vehicleNumber: true,
            rating: true,
            user: {
              select: {
                name: true,
                phone: true,
                image: true,
              },
            },
          },
        },
        review: true,
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('GET order error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { status, message } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !['RESTAURANT_OWNER', 'DELIVERY_PARTNER', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const validStatuses = ['ACCEPTED', 'PREPARING', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(status === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
        trackingUpdates: {
          create: {
            status,
            message: message || `Order ${status.toLowerCase().replace('_', ' ')}`,
          },
        },
      },
      include: {
        trackingUpdates: { orderBy: { createdAt: 'asc' } },
      },
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: order.customerId,
        title: 'Order Update',
        message: message || `Your order status has been updated to ${status.toLowerCase().replace('_', ' ')}`,
        type: 'ORDER_UPDATE',
        data: { orderId: order.id, status },
      },
    });

    // If delivered and payment is cash on delivery, mark as completed and add cashback
    if (status === 'DELIVERED' && order.paymentMethod === 'CASH_ON_DELIVERY') {
      await prisma.order.update({
        where: { id },
        data: { paymentStatus: 'COMPLETED' },
      });

      // Add 2% cashback as reward points
      const cashback = order.total * 0.02;
      await prisma.wallet.update({
        where: { userId: order.customerId },
        data: {
          rewardPoints: { increment: Math.floor(cashback * 10) },
          cashbackEarned: { increment: cashback },
        },
      });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('PATCH order error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}
