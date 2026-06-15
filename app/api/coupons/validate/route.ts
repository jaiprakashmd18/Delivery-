import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { code, orderAmount } = await request.json();

    if (!code || !orderAmount) {
      return NextResponse.json({
        success: false,
        error: 'Coupon code and order amount are required',
      }, { status: 400 });
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase().trim(),
        isActive: true,
        minOrderAmount: { lte: orderAmount },
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gt: new Date() } },
            ],
          },
          {
            OR: [
              { usageLimit: null },
              // usageCount will be compared post-fetch
            ],
          },
        ],
      },
    });

    if (!coupon) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired coupon code',
        data: { isValid: false, discount: 0 },
      });
    }

    // Check if usage limit reached
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({
        success: false,
        error: 'Coupon usage limit reached',
        data: { isValid: false, discount: 0 },
      });
    }

    // Check if user already used this coupon
    const existingUsage = await prisma.couponUsage.findFirst({
      where: {
        couponId: coupon.id,
        userId: session.user.id,
      },
    });

    if (existingUsage) {
      return NextResponse.json({
        success: false,
        error: 'You have already used this coupon',
        data: { isValid: false, discount: 0 },
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = orderAmount * (coupon.discountValue / 100);
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, orderAmount);
    }

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discountAmount: Math.round(discountAmount * 100) / 100,
      message: `Coupon applied! You save ₾${discountAmount.toFixed(2)}`,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to validate coupon',
    }, { status: 500 });
  }
}
