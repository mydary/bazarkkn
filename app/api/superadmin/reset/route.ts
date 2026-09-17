import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.orderGroup.deleteMany(),
    prisma.order.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.kelompok.updateMany({
      data: { qrisImageUrl: null, whatsappNumber: null },
    }),
    prisma.bazarSetting.upsert({
      where: { id: "singleton" },
      update: { isOpen: false },
      create: { id: "singleton", isOpen: false },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
