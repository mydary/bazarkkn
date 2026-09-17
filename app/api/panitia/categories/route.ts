import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";

export async function GET() {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const categories = await prisma.category.findMany({
    where: { kelompokId: auth.kelompokId },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });

  const category = await prisma.category.create({
    data: { kelompokId: auth.kelompokId, name },
  });
  return NextResponse.json({ category });
}
