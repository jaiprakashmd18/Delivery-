import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalUsers, newUsersToday, totalOrders, ordersToday,
    revenueTotal, revenueToday, activeDeliveries,
    pendingRestaurants, pendingPartners,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: "DELIVERED" } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: "DELIVERED", createdAt: { gte: today } } }),
    prisma.order.count({ where: { status: { in: ["ACCEPTED", "PREPARING", "PICKED_UP", "OUT_FOR_DELIVERY"] } } }),
    prisma.restaurant.count({ where: { isVerified: false, isActive: true } }),
    prisma.deliveryPartner.count({ where: { isVerified: false, isActive: true } }),
  ]);

  return NextResponse.json({
    totalUsers,
    newUsersToday,
    totalOrders,
    ordersToday,
    totalRevenue: revenueTotal._sum.total ?? 0,
    revenueToday: revenueToday._sum.total ?? 0,
    activeDeliveries,
    pendingRestaurants,
    pendingPartners,
  });
}
