"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { getPusherClient } from "@/lib/pusher-client";
import { ORDER_UPDATED_EVENT } from "@/lib/pusher-shared";
import { buildWaMessage, buildWaLink } from "@/lib/wa";

type Item = { id: string; qty: number; priceAtOrder: number; product: { name: string } };
type Group = {
  id: string;
  subtotal: number;
  status: string;
  pickupToken: string;
  kelompok: { id: string; name: string; whatsappNumber?: string };
  items: Item[];
};
type OrderDetail = {
  id: string;
  buyerName: string;
  buyerContact: string;
  deliveryMethod: "PICKUP" | "DELIVER";
  deliveryLocation?: string;
  groups: Group[];
};

const STATUS_TEXT: Record<string, string> = {
  AWAITING_CLAIM: "Menunggu pembayaran",
  WAITING_VERIFICATION: "Menunggu konfirmasi panitia",
  VERIFIED: "Terverifikasi",
  COMPLETED: "Selesai",
  REJECTED: "Perlu bayar ulang",
};

export default function PesananPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});

  async function load() {
    const res = await fetch(`/api/orders/${params.orderId}`);
    const data = await res.json();
    setOrder(data.order);
  }

  useEffect(() => {
    load();
  }, [params.orderId]);

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`order-${params.orderId}`);
    channel.bind(ORDER_UPDATED_EVENT, () => load());
    return () => {
      channel.unbind(ORDER_UPDATED_EVENT);
      pusher.unsubscribe(`order-${params.orderId}`);
    };
  }, [params.orderId]);

  useEffect(() => {
    if (!order || typeof window === "undefined") return;
    order.groups.forEach((g) => {
      if (g.status !== "VERIFIED" || qrImages[g.id]) return;
      const url = `${window.location.origin}/verify/${g.pickupToken}`;
      QRCode.toDataURL(url, { width: 260, margin: 1 }).then((dataUrl) => {
        setQrImages((prev) => ({ ...prev, [g.id]: dataUrl }));
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-display text-kerbau">Memuat pesanan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto px-5 pb-10">
      <h1 className="font-display font-bold text-2xl text-ink pt-8 mb-1">Status Pesanan</h1>
      <p className="text-sm text-kerbau mb-1">Atas nama {order.buyerName}</p>
      <p className="text-[10px] text-kerbau/40 mb-4">Dibuat oleh Dary Ikhsan, Fakultas Ilmu Komputer, UNIBA</p>

      <div className="bg-gabah/10 border border-gabah/20 rounded-lg p-3 mb-5">
        <p className="text-xs text-ink/70 leading-relaxed">
          <strong className="text-ink">Cara pakai:</strong> Status diperbarui otomatis. Jika status &quot;Menunggu pembayaran&quot;, klik tombol WhatsApp untuk konfirmasi ke penjual. Jika &quot;Terverifikasi&quot;, tunjukkan barcode ke penjual saat pengambilan.
        </p>
      </div>

      <div className="space-y-4">
        {order.groups.map((g) => {
          const waLink = g.kelompok.whatsappNumber
            ? buildWaLink(
                g.kelompok.whatsappNumber,
                buildWaMessage({
                  kelompokName: g.kelompok.name,
                  buyerName: order.buyerName,
                  buyerContact: order.buyerContact,
                  deliveryMethod: order.deliveryMethod,
                  deliveryLocation: order.deliveryLocation,
                  items: g.items.map((it) => ({
                    name: it.product.name,
                    qty: it.qty,
                    priceAtOrder: it.priceAtOrder,
                  })),
                  subtotal: g.subtotal,
                })
              )
            : null;

          return (
            <div key={g.id} className="bg-white rounded-xl border border-kerbau/10 p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="font-display font-semibold text-ink">{g.kelompok.name}</p>
                <span className="text-xs px-2 py-1 rounded-full bg-anyaman-soft text-kerbau">
                  {STATUS_TEXT[g.status] ?? g.status}
                </span>
              </div>
              <ul className="text-sm text-ink/80 space-y-0.5 mb-3">
                {g.items.map((it) => (
                  <li key={it.id}>{it.qty}× {it.product.name}</li>
                ))}
              </ul>
              <p className="tabular text-sm text-gabah font-medium mb-3">
                Rp{g.subtotal.toLocaleString("id-ID")}
              </p>

              {g.status === "WAITING_VERIFICATION" && waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center bg-[#25D366] text-white rounded-lg py-2.5 text-sm font-medium"
                >
                  Kirim konfirmasi ke WhatsApp penjual
                </a>
              )}

              {g.status === "VERIFIED" && order.deliveryMethod === "PICKUP" && (
                <div className="text-center pt-2">
                  <p className="text-xs text-kerbau mb-2">
                    Tunjukkan barcode ini ke penjual di lokasi pengambilan
                  </p>
                  {qrImages[g.id] && (
                    <img src={qrImages[g.id]} alt="Barcode ambil pesanan" className="mx-auto w-40 h-40" />
                  )}
                </div>
              )}

              {g.status === "VERIFIED" && order.deliveryMethod === "DELIVER" && (
                <p className="text-sm text-paddy text-center pt-1">
                  Pesanan akan diantar ke {order.deliveryLocation}
                </p>
              )}

              {g.status === "COMPLETED" && (
                <p className="text-sm text-paddy text-center pt-1">
                  {order.deliveryMethod === "PICKUP" ? "Sudah diambil" : "Sudah diantar"} ✓
                </p>
              )}
            </div>
          );
        })}
      </div>
      <a href="/pasar" className="mt-6 text-sm text-paddy hover:underline">&larr; Kembali ke Pasar</a>
    </div>
  );
}
