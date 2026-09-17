import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";

// GET /api/panitia/queue -- semua OrderGroup milik kelompok staff yang login,
// terbaru dulu, untuk ditampilkan per status di dashboard.
export async function GET() {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const groups = await prisma.orderGroup.findMany({
    where: { kelompokId: auth.kelompokId },
    include: { items: { include: { product: true } }, order: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ groups });
}
