import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status');
  const skip = (page - 1) * limit;

  try {
    const where = {
      customerId: session.user.id,
      ...(status && status !== 'ALL'
        ? {
            status: status as
              | 'PENDING'
              | 'ACCEPTED'
              | 'PREPARING'
              | 'PICKED_UP'
              | 'OUT_FOR_DELIVERY'
              | 'DELIVERED'
              | 'CANCELLED'
              | 'REFUNDED',
          }
        : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          items: {
            take: 3,
            include: {
              menuItem: {
                select: { name: true, image: true },
              },
            },
          },
          address: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET orders error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { generateOrderNumber } = await import('@/lib/utils');

    // Direct checkout flow: items + deliveryAddress string
    if (body.deliveryAddress && !body.deliveryAddressId) {
      const {
        items, restaurantId, deliveryAddress, notes, paymentMethod,
        subtotal, deliveryFee, tax, discount, total,
      } = body;

      if (!items?.length) {
        return NextResponse.json({ success: false, error: 'No items provided' }, { status: 400 });
      }

      const menuItemIds = items.map((i: { menuItemId: string }) => i.menuItemId);
      const menuItems = await prisma.menuItem.findMany({
        where: { id: { in: menuItemIds }, isAvailable: true },
      });

      const orderItems = items.map((item: { menuItemId: string; quantity: number }) => {
        const mi = menuItems.find((m) => m.id === item.menuItemId);
        if (!mi) throw new Error(`Menu item ${item.menuItemId} not found`);
        return {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: mi.price,
          totalPrice: mi.price * item.quantity,
        };
      });

      const order = await prisma.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId: session.user.id,
          restaurantId: restaurantId || null,
          type: restaurantId ? 'FOOD' : 'PERSONAL_PICKUP',
          status: 'PENDING',
          subtotal: subtotal ?? orderItems.reduce((s: number, i: { totalPrice: number }) => s + i.totalPrice, 0),
          deliveryFee: deliveryFee ?? 3,
          tax: tax ?? 0,
          discount: discount ?? 0,
          total: total ?? orderItems.reduce((s: number, i: { totalPrice: number }) => s + i.totalPrice, 0) + (deliveryFee ?? 3),
          paymentMethod: paymentMethod ?? 'CASH_ON_DELIVERY',
          paymentStatus: 'PENDING',
          deliveryAddress,
          notes: notes || null,
          items: { create: orderItems },
        },
      });

      return NextResponse.json({ success: true, data: order }, { status: 201 });
    }

    // Address-ID flow (used by proper checkout with saved addresses)
    const { placeOrder } = await import('@/actions/orders');
    const result = await placeOrder(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (error) {
    console.error('POST order error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}
