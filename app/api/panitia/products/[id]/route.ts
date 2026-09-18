import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const existing = await prisma.product.findUnique({ where: { id: params.id } });
  if (!existing || existing.kelompokId !== auth.kelompokId) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.price !== undefined) data.price = Number(body.price);
  if (body.categoryId !== undefined) data.categoryId = body.categoryId;
  if (body.isAvailable !== undefined) data.isAvailable = Boolean(body.isAvailable);
  if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl;

  const product = await prisma.product.update({ where: { id: params.id }, data });
  return NextResponse.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const existing = await prisma.product.findUnique({ where: { id: params.id } });
  if (!existing || existing.kelompokId !== auth.kelompokId) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
