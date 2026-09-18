import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const totalOrders = await prisma.order.count().catch(() => 0);

    const totalRevenueResult = await prisma.orderGroup.aggregate({
      _sum: { subtotal: true },
      where: { status: { in: ["VERIFIED", "COMPLETED"] } },
    }).catch(() => ({ _sum: { subtotal: 0 } }));

    const completedOrders = await prisma.orderGroup.count({ where: { status: "COMPLETED" } }).catch(() => 0);
    const pendingOrders = await prisma.orderGroup.count({ where: { status: { in: ["AWAITING_CLAIM", "WAITING_VERIFICATION"] } } }).catch(() => 0);
    const totalProducts = await prisma.product.count().catch(() => 0);
    const totalKelompok = await prisma.kelompok.count().catch(() => 0);

    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { id: "desc" },
      include: {
        groups: { select: { subtotal: true, status: true, kelompok: { select: { name: true } } } },
      },
    }).catch(() => []);

    const kelompokStats = await prisma.kelompok.findMany({
      select: {
        name: true,
        orderGroups: { select: { subtotal: true, status: true } },
        products: { select: { id: true } },
      },
    }).catch(() => []);

    const categoryStats = await prisma.category.findMany({
      select: {
        name: true,
        products: {
          select: { orderItems: { select: { qty: true, priceAtOrder: true } } },
        },
      },
    }).catch(() => []);

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
      totalRevenue: totalRevenueResult._sum.subtotal ?? 0,
      completedOrders,
      pendingOrders,
      totalProducts,
      totalKelompok,
      recentOrders,
      kelompokRevenue,
      categoryRevenue,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Gagal memuat statistik" }, { status: 500 });
  }
}
