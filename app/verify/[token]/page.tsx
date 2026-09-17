"use client";

import { useEffect, useState } from "react";

type Group = {
  id: string;
  status: string;
  subtotal: number;
  order: { buyerName: string; buyerContact: string; deliveryMethod: string; deliveryLocation?: string };
  items: { id: string; qty: number; product: { name: string } }[];
  kelompok: { name: string };
};

const STATUS_TEXT: Record<string, string> = {
  AWAITING_CLAIM: "Belum dibayar",
  WAITING_VERIFICATION: "Menunggu konfirmasi",
  VERIFIED: "Terverifikasi",
  COMPLETED: "Sudah selesai",
  REJECTED: "Ditolak",
};

export default function VerifyPage({ params }: { params: { token: string } }) {
  const [group, setGroup] = useState<Group | null>(null);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);

  async function load() {
    const res = await fetch(`/api/order-groups/token/${params.token}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Gagal memuat");
      return;
    }
    setGroup(data.orderGroup);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.token]);

  async function act(action: "verify" | "complete") {
    if (!group) return;
    setActing(true);
    await fetch(`/api/order-groups/${group.id}/${action}`, { method: "PATCH" });
    await load();
    setActing(false);
  }

  if (error) {
    return (
      <div className="min-h-screen bg-paddy flex items-center justify-center px-6">
        <p className="text-cream text-center">{error}</p>
      </div>
    );
  }
  if (!group) {
    return (
      <div className="min-h-screen bg-paddy flex items-center justify-center">
        <p className="text-cream/70">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paddy flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-2xl p-5">
        <div className="bg-gabah/10 border border-gabah/20 rounded-lg p-2.5 mb-4">
          <p className="text-xs text-ink/70 leading-relaxed">
            Halaman ini dibuka otomatis saat scan barcode. Konfirmasi pembayaran jika sudah sesuai.
          </p>
        </div>
        <p className="text-xs text-kerbau">{group.kelompok.name}</p>
        <h1 className="font-display font-bold text-xl text-ink mt-1">{group.order.buyerName}</h1>
        <p className="text-sm text-kerbau mb-4">{group.order.buyerContact}</p>

        <ul className="text-sm text-ink/80 space-y-1 mb-3">
          {group.items.map((it) => (
            <li key={it.id}>{it.qty}× {it.product.name}</li>
          ))}
        </ul>
        <p className="tabular font-display font-semibold text-gabah mb-4">
          Rp{group.subtotal.toLocaleString("id-ID")}
        </p>

        <p className="text-sm text-kerbau mb-4">
          Status saat ini: <span className="font-medium text-ink">{STATUS_TEXT[group.status]}</span>
        </p>

        {group.status === "WAITING_VERIFICATION" && (
          <button
            onClick={() => act("verify")}
            disabled={acting}
            className="w-full bg-paddy text-cream rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {acting ? <span className="spinner-dark inline-block mr-1" /> : null}
            {acting ? "Memproses..." : "Konfirmasi pembayaran"}
          </button>
        )}
        {group.status === "VERIFIED" && (
          <button
            onClick={() => act("complete")}
            disabled={acting}
            className="w-full bg-gabah text-ink rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {acting ? <span className="spinner-dark inline-block mr-1" /> : null}
            {acting ? "Memproses..." : "Tandai sudah diambil"}
          </button>
        )}
        {group.status === "COMPLETED" && (
          <p className="text-center text-paddy text-sm font-medium">Pesanan ini sudah selesai ✓</p>
        )}
        {group.status === "AWAITING_CLAIM" && (
          <p className="text-center text-sm text-kerbau">Pembeli belum klik "saya sudah bayar".</p>
        )}
      </div>
    </div>
  );
}
