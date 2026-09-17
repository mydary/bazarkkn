"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getPusherClient } from "@/lib/pusher-client";
import { ORDER_UPDATED_EVENT } from "@/lib/pusher-shared";

type Item = { id: string; qty: number; product: { name: string } };
type Group = {
  id: string;
  status: string;
  subtotal: number;
  proofImageUrl?: string;
  createdAt: string;
  order: { buyerName: string; buyerContact: string; deliveryMethod: string; deliveryLocation?: string };
  items: Item[];
};

export default function PanitiaQueuePage() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [actingId, setActingId] = useState<string | null>(null);
  const [showProofId, setShowProofId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/panitia/queue");
    const data = await res.json();
    setGroups(data.groups ?? []);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const kelompokId = (session?.user as any)?.kelompokId;
    if (!kelompokId) return;
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`kelompok-${kelompokId}`);
    channel.bind(ORDER_UPDATED_EVENT, () => load());
    return () => {
      channel.unbind(ORDER_UPDATED_EVENT);
      pusher.unsubscribe(`kelompok-${kelompokId}`);
    };
  }, [session]);

  async function act(id: string, action: "verify" | "reject" | "complete") {
    setActingId(id);
    await fetch(`/api/order-groups/${id}/${action}`, { method: "PATCH" });
    setActingId(null);
    load();
  }

  const waiting = groups.filter((g) => g.status === "WAITING_VERIFICATION");
  const verified = groups.filter((g) => g.status === "VERIFIED");
  const awaitingClaim = groups.filter((g) => g.status === "AWAITING_CLAIM");
  const completed = groups.filter((g) => g.status === "COMPLETED").slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-semibold text-xl text-ink mb-1">Antrean Pesanan</h1>
        <p className="text-sm text-kerbau">
          {awaitingClaim.length} pesanan menunggu pembeli membayar.
        </p>
        <div className="bg-gabah/10 border border-gabah/20 rounded-lg p-3 mt-2 mb-2">
          <p className="text-xs text-ink/70 leading-relaxed">
            <strong className="text-ink">Cara pakai:</strong> &quot;Menunggu konfirmasi&quot; = pembeli sudah bayar, cek bukti lalu konfirmasi. &quot;Siap diambil&quot; = tandai selesai setelah barang diambil/diantar. Scan barcode untuk verifikasi pengambilan di lokasi.
          </p>
        </div>
        <a
          href="/panitia/scan"
          className="inline-block mt-2 bg-gabah text-ink rounded-lg px-4 py-2 text-sm font-medium"
        >
          📷 Scan Barcode
        </a>
      </div>

      <section>
        <h2 className="text-sm font-medium text-paddy mb-3">
          Menunggu konfirmasi ({waiting.length})
        </h2>
        <div className="space-y-3">
          {waiting.map((g) => (
            <div key={g.id} className="bg-white rounded-xl border border-kerbau/10 p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-ink">{g.order.buyerName}</p>
                  <p className="text-xs text-kerbau">{g.order.buyerContact}</p>
                </div>
                <p className="tabular font-display font-semibold text-gabah">
                  Rp{g.subtotal.toLocaleString("id-ID")}
                </p>
              </div>
              <ul className="text-sm text-ink/80 mb-3">
                {g.items.map((it) => (
                  <li key={it.id}>{it.qty}× {it.product.name}</li>
                ))}
              </ul>
              <p className="text-xs text-kerbau mb-3">
                {g.order.deliveryMethod === "DELIVER"
                  ? `Antar ke: ${g.order.deliveryLocation}`
                  : "Ambil sendiri"}
              </p>
              {g.proofImageUrl && (
                <div className="mb-3">
                  <button
                    onClick={() => setShowProofId(showProofId === g.id ? null : g.id)}
                    className="text-xs text-paddy underline cursor-pointer"
                  >
                    {showProofId === g.id ? "Sembunyikan bukti" : "Lihat bukti pembayaran"}
                  </button>
                  {showProofId === g.id && (
                    <img src={g.proofImageUrl} alt="Bukti pembayaran" className="w-full max-h-48 object-contain rounded-lg border border-kerbau/15 mt-2" />
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => act(g.id, "verify")}
                  disabled={actingId === g.id}
                  className="flex-1 bg-paddy text-cream rounded-lg py-2 text-sm font-medium disabled:opacity-50"
                >
                  {actingId === g.id ? <span className="spinner inline-block mr-1" /> : null}
                  {actingId === g.id ? "Memproses..." : "Konfirmasi bayar"}
                </button>
                <button
                  onClick={() => act(g.id, "reject")}
                  disabled={actingId === g.id}
                  className="px-3 rounded-lg text-sm text-red-600 border border-red-200 disabled:opacity-50"
                >
                  {actingId === g.id ? <span className="spinner inline-block mr-1" /> : null}
                  Belum masuk
                </button>
              </div>
            </div>
          ))}
          {waiting.length === 0 && <p className="text-sm text-kerbau">Tidak ada klaim baru.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-paddy mb-3">
          Siap diambil / diantar ({verified.length})
        </h2>
        <div className="space-y-3">
          {verified.map((g) => (
            <div key={g.id} className="bg-white rounded-xl border border-kerbau/10 p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-ink">{g.order.buyerName}</p>
                <p className="text-xs text-kerbau">
                  {g.order.deliveryMethod === "DELIVER" ? `Antar: ${g.order.deliveryLocation}` : "Ambil sendiri"}
                </p>
              </div>
              <button
                onClick={() => act(g.id, "complete")}
                disabled={actingId === g.id}
                className="bg-gabah text-ink rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50"
              >
                {actingId === g.id ? <span className="spinner inline-block mr-1" /> : null}
                {actingId === g.id ? "Memproses..." : "Tandai selesai"}
              </button>
            </div>
          ))}
          {verified.length === 0 && <p className="text-sm text-kerbau">Belum ada yang siap.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-kerbau mb-3">Riwayat selesai</h2>
        <div className="space-y-2">
          {completed.map((g) => (
            <div key={g.id} className="text-sm text-kerbau flex justify-between border-b border-kerbau/10 pb-2">
              <span>{g.order.buyerName}</span>
              <span className="tabular">Rp{g.subtotal.toLocaleString("id-ID")}</span>
            </div>
          ))}
          {completed.length === 0 && <p className="text-sm text-kerbau">Belum ada.</p>}
        </div>
      </section>
    </div>
  );
}
