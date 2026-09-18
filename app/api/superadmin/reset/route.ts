import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_CATEGORIES = ["Makanan", "Minuman", "Aksesoris", "Hiasan", "Craft", "Souvenir"];

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
    prisma.kelompok.updateMany({
      data: { qrisImageUrl: null, whatsappNumber: null },
    }),
    prisma.bazarSetting.upsert({
      where: { id: "singleton" },
      update: { isOpen: false },
      create: { id: "singleton", isOpen: false },
    }),
  ]);

  // Restore kategori yang mungkin terhapus
  const kelompokList = await prisma.kelompok.findMany();
  for (const k of kelompokList) {
    const existing = await prisma.category.findMany({ where: { kelompokId: k.id } });
    const existingNames = existing.map((c) => c.name);
    for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
      if (!existingNames.includes(DEFAULT_CATEGORIES[i])) {
        await prisma.category.create({
          data: { kelompokId: k.id, name: DEFAULT_CATEGORIES[i], sortOrder: i },
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
