import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/orders/:id -- dipakai halaman bayar & status pesanan
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      groups: {
        include: {
          kelompok: true,
          items: { include: { product: true } },
        },
      },
    },
  });
  if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ order });
}
