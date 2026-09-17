import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { pusherServer, kelompokChannel, orderChannel, ORDER_UPDATED_EVENT } from "@/lib/pusher";

// PATCH /api/order-groups/:id/complete -- pesanan sudah diambil/diantar.
export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const group = await prisma.orderGroup.findUnique({ where: { id: params.id } });
  if (!group || group.kelompokId !== auth.kelompokId) {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }
  if (group.status !== "VERIFIED") {
    return NextResponse.json({ error: "Pesanan belum terverifikasi" }, { status: 409 });
  }

  const updated = await prisma.orderGroup.update({
    where: { id: params.id },
    data: { status: "COMPLETED", completedAt: new Date() },
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
