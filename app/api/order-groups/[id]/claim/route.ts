import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer, kelompokChannel, orderChannel, ORDER_UPDATED_EVENT } from "@/lib/pusher";

// PATCH /api/order-groups/:id/claim -- pembeli klik "Saya sudah bayar"
// Body: { proofImageUrl? } - screenshot bukti pembayaran (opsional tapi disarankan)
// Status jadi WAITING_VERIFICATION, menunggu dikonfirmasi panitia kelompok.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { proofImageUrl } = body as { proofImageUrl?: string };

  const group = await prisma.orderGroup.findUnique({ where: { id: params.id } });
  if (!group) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  if (group.status !== "AWAITING_CLAIM") {
    return NextResponse.json({ error: "Status sudah berubah" }, { status: 409 });
  }

  const updated = await prisma.orderGroup.update({
    where: { id: params.id },
    data: { status: "WAITING_VERIFICATION", claimedAt: new Date(), proofImageUrl },
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
