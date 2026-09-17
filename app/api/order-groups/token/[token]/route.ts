import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";

// GET /api/order-groups/token/:token -- dipakai halaman /verify/[token]
// setelah panitia scan barcode pembeli.
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const group = await prisma.orderGroup.findUnique({
    where: { pickupToken: params.token },
    include: { items: { include: { product: true } }, order: true, kelompok: true },
  });
  if (!group) return NextResponse.json({ error: "Barcode tidak dikenali" }, { status: 404 });
  if (group.kelompokId !== auth.kelompokId) {
    return NextResponse.json({ error: "Pesanan ini bukan milik kelompok Anda" }, { status: 403 });
  }

  return NextResponse.json({ orderGroup: group });
}
