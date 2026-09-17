import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/pasar -- daftar semua kelompok + kategori + produk (untuk halaman pasar)
export async function GET() {
  const kelompokList = await prisma.kelompok.findMany({
    include: {
      categories: {
        orderBy: { sortOrder: "asc" },
        include: { products: { where: { isAvailable: true } } },
      },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ kelompokList });
}
