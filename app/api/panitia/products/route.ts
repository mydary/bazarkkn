import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";

export async function GET() {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const products = await prisma.product.findMany({
    where: { kelompokId: auth.kelompokId },
    include: { category: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const { categoryId, name, description, price, imageUrl } = await req.json();
  if (!categoryId || !name || !price) {
    return NextResponse.json({ error: "Kategori, nama, dan harga wajib diisi" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      kelompokId: auth.kelompokId,
      categoryId,
      name,
      description,
      price: Number(price),
      imageUrl,
    },
  });
  return NextResponse.json({ product });
}
