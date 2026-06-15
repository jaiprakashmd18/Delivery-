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
