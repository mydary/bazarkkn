import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { pusherServer, kelompokChannel, orderChannel, ORDER_UPDATED_EVENT } from "@/lib/pusher";

// PATCH /api/order-groups/:id/reject -- panitia tidak menemukan bukti bayar masuk,
// kembalikan status supaya pembeli bisa klaim ulang (mis. setelah transfer ulang).
export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const group = await prisma.orderGroup.findUnique({ where: { id: params.id } });
  if (!group || group.kelompokId !== auth.kelompokId) {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }
  if (group.status !== "WAITING_VERIFICATION") {
    return NextResponse.json({ error: "Status tidak bisa ditolak dari sini" }, { status: 409 });
  }

  const updated = await prisma.orderGroup.update({
    where: { id: params.id },
    data: { status: "AWAITING_CLAIM", claimedAt: null },
  });

  await Promise.all([
    pusherServer.trigger(kelompokChannel(group.kelompokId), ORDER_UPDATED_EVENT, {
      orderGroupId: group.id,
      status: updated.status,
    }),
    pusherServer.trigger(orderChannel(group.orderId), ORDER_UPDATED_EVENT, {
      orderGroupId: group.id,
      status: updated.status,
    }),
  ]);

  return NextResponse.json({ orderGroup: updated });
}
