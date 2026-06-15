'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { generateOrderNumber } from '@/lib/utils';
import type { PlaceOrderInput } from '@/types';

export async function placeOrder(orderData: PlaceOrderInput) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const userId = session.user.id;

    // Validate delivery address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: orderData.deliveryAddressId, userId },
    });

    if (!address) {
      return { success: false, error: 'Invalid delivery address' };
    }

    // Get menu items and validate
    const menuItemIds = orderData.items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, isAvailable: true },
    });

    if (menuItems.length !== orderData.items.length) {
      return { success: false, error: 'Some items are unavailable' };
    }

    // Calculate pricing
    let subtotal = 0;
    const orderItemsData = orderData.items.map((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId)!;
      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        totalPrice: itemTotal,
        notes: item.specialInstructions || null,
      };
    });

    const deliveryFee = subtotal >= 30 ? 0 : 3;
    const tax = subtotal * 0.18;

    // Validate and apply coupon
    let discount = 0;
    let couponId: string | null = null;
    if (orderData.couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: orderData.couponCode.toUpperCase(),
          isActive: true,
          endDate: { gt: new Date() },
          minOrderAmount: { lte: subtotal },
        },
      });

      if (coupon) {
        if (coupon.discountType === 'PERCENTAGE') {
          discount = subtotal * (coupon.discountValue / 100);
          if (coupon.maxDiscount) {
            discount = Math.min(discount, coupon.maxDiscount);
          }
        } else {
          discount = coupon.discountValue;
        }
        couponId = coupon.id;
      }
    }

    const total = subtotal + deliveryFee + tax - discount;

    // Handle wallet payment
    if (orderData.paymentMethod === 'WALLET') {
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.balance < total) {
        return { success: false, error: 'Insufficient wallet balance' };
      }
    }

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId: userId,
          restaurantId: orderData.restaurantId,
          status: 'PENDING',
          type: orderData.type || 'FOOD',
          subtotal,
          deliveryFee,
          tax,
          discount,
          total,
          paymentMethod: orderData.paymentMethod,
          paymentStatus: 'PENDING',
          addressId: orderData.deliveryAddressId,
          deliveryAddress: address.fullAddress,
          notes: orderData.deliveryInstructions || null,
          items: {
            create: orderItemsData,
          },
          trackingUpdates: {
            create: {
              status: 'PENDING',
              message: 'Order placed successfully',
            },
          },
        },
        include: {
          items: true,
          trackingUpdates: true,
        },
      });

      // Deduct from wallet if payment method is WALLET
      if (orderData.paymentMethod === 'WALLET') {
        await tx.wallet.update({
          where: { userId },
          data: {
            balance: { decrement: total },
            transactions: {
              create: {
                type: 'DEBIT',
                amount: total,
                description: `Order #${newOrder.orderNumber}`,
                reference: newOrder.id,
              },
            },
          },
        });

        await tx.order.update({
          where: { id: newOrder.id },
          data: { paymentStatus: 'COMPLETED' },
        });
      }

      // Mark coupon as used
      if (couponId) {
        await tx.couponUsage.create({
          data: {
            couponId,
            userId,
            orderId: newOrder.id,
            discountAmount: discount,
          },
        });
      }

      // Create notification for user
      await tx.notification.create({
        data: {
          userId,
          title: 'Order Placed!',
          message: `Your order #${newOrder.orderNumber} has been placed successfully.`,
          type: 'ORDER_UPDATE',
          data: { orderId: newOrder.id, orderNumber: newOrder.orderNumber },
        },
      });

      return newOrder;
    });

    revalidatePath('/dashboard/orders');
    return { success: true, data: { orderId: order.id, orderNumber: order.orderNumber } };
  } catch (error) {
    console.error('Place order error:', error);
    return { success: false, error: 'Failed to place order. Please try again.' };
  }
}

export async function cancelOrder(orderId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId: session.user.id },
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    if (!['PENDING', 'ACCEPTED'].includes(order.status)) {
      return { success: false, error: 'Order cannot be cancelled at this stage' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          trackingUpdates: {
            create: {
              status: 'CANCELLED',
              message: 'Order cancelled by customer',
            },
          },
        },
      });

      // Refund to wallet if paid via wallet
      if (order.paymentMethod === 'WALLET' && order.paymentStatus === 'COMPLETED') {
        await tx.wallet.update({
          where: { userId: session.user.id! },
          data: {
            balance: { increment: order.total },
            transactions: {
              create: {
                type: 'CREDIT',
                amount: order.total,
                description: `Refund for Order #${order.orderNumber}`,
                reference: order.id,
              },
            },
          },
        });

        await tx.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'REFUNDED', status: 'REFUNDED' },
        });
      }

      await tx.notification.create({
        data: {
          userId: session.user.id!,
          title: 'Order Cancelled',
          message: `Your order #${order.orderNumber} has been cancelled.`,
          type: 'ORDER_UPDATE',
          data: { orderId: order.id },
        },
      });
    });

    revalidatePath('/dashboard/orders');
    revalidatePath(`/dashboard/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error('Cancel order error:', error);
    return { success: false, error: 'Failed to cancel order' };
  }
}

export async function reorderPrevious(orderId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId: session.user.id },
      include: {
        items: {
          include: {
            menuItem: { select: { name: true, price: true, image: true } },
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // Return cart items for the previous order
    const cartItems = order.items.map((item) => ({
      id: `${item.menuItemId}-${Date.now()}`,
      menuItemId: item.menuItemId,
      name: item.menuItem.name,
      price: item.unitPrice,
      quantity: item.quantity,
      image: item.menuItem.image ?? undefined,
      restaurantId: order.restaurantId || '',
      restaurantName: 'Restaurant',
      specialInstructions: item.notes || undefined,
    }));

    return { success: true, data: { cartItems, restaurantId: order.restaurantId } };
  } catch (error) {
    console.error('Reorder error:', error);
    return { success: false, error: 'Failed to reorder' };
  }
}

export async function rateOrder(orderId: string, rating: number, comment: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId: session.user.id, status: 'DELIVERED' },
    });

    if (!order) {
      return { success: false, error: 'Order not found or not delivered' };
    }

    if (!order.restaurantId) {
      return { success: false, error: 'No restaurant associated with this order' };
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findFirst({
      where: { orderId, userId: session.user.id },
    });

    if (existingReview) {
      return { success: false, error: 'You have already reviewed this order' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.create({
        data: {
          userId: session.user.id!,
          restaurantId: order.restaurantId!,
          orderId,
          rating,
          comment,
        },
      });

      // Update restaurant average rating
      const reviews = await tx.review.findMany({
        where: { restaurantId: order.restaurantId! },
        select: { rating: true },
      });

      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      await tx.restaurant.update({
        where: { id: order.restaurantId! },
        data: {
          rating: avgRating,
          totalRatings: reviews.length,
        },
      });

      // Award reward points for reviewing
      await tx.wallet.update({
        where: { userId: session.user.id! },
        data: {
          rewardPoints: { increment: 10 },
        },
      });
    });

    revalidatePath(`/dashboard/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error('Rate order error:', error);
    return { success: false, error: 'Failed to submit review' };
  }
}
