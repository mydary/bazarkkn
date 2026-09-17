import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [
    totalOrders,
    totalRevenue,
    completedOrders,
    pendingOrders,
    totalProducts,
    totalKelompok,
    recentOrders,
    kelompokStats,
    categoryStats,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.orderGroup.aggregate({ _sum: { subtotal: true }, where: { status: { in: ["VERIFIED", "COMPLETED"] } } }),
    prisma.orderGroup.count({ where: { status: "COMPLETED" } }),
    prisma.orderGroup.count({ where: { status: { in: ["AWAITING_CLAIM", "WAITING_VERIFICATION"] } } }),
    prisma.product.count(),
    prisma.kelompok.count(),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        groups: { select: { subtotal: true, status: true, kelompok: { select: { name: true } } } },
      },
    }),
    prisma.kelompok.findMany({
      select: {
        name: true,
        orderGroups: {
          select: { subtotal: true, status: true },
        },
        products: { select: { id: true } },
      },
    }),
    prisma.category.findMany({
      select: {
        name: true,
        products: {
          select: {
            orderItems: { select: { qty: true, priceAtOrder: true } },
          },
        },
      },
    }),
  ]);

  const kelompokRevenue = kelompokStats.map((k) => ({
    name: k.name,
    productCount: k.products.length,
    revenue: k.orderGroups
      .filter((g) => ["VERIFIED", "COMPLETED"].includes(g.status))
      .reduce((sum, g) => sum + g.subtotal, 0),
    orderCount: k.orderGroups.length,
    completedCount: k.orderGroups.filter((g) => g.status === "COMPLETED").length,
  }));

  const categoryRevenue = categoryStats.map((c) => {
    let totalRevenue = 0;
    let totalQty = 0;
    for (const p of c.products) {
      for (const item of p.orderItems) {
        totalRevenue += item.priceAtOrder * item.qty;
        totalQty += item.qty;
      }
    }
    return { name: c.name, revenue: totalRevenue, qty: totalQty };
  }).filter((c) => c.qty > 0).sort((a, b) => b.revenue - a.revenue);

  return NextResponse.json({
    totalOrders,
    totalRevenue: totalRevenue._sum.subtotal ?? 0,
    completedOrders,
    pendingOrders,
    totalProducts,
    totalKelompok,
    recentOrders,
    kelompokRevenue,
    categoryRevenue,
  });
}
