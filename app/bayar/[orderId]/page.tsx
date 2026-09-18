"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Item = { id: string; qty: number; priceAtOrder: number; product: { name: string } };
type Group = {
  id: string;
  subtotal: number;
  status: string;
  kelompok: { id: string; name: string; qrisImageUrl?: string };
  items: Item[];
};
type OrderDetail = { id: string; groups: Group[] };

export default function BayarPage({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const res = await fetch(`/api/orders/${params.orderId}`);
    const data = await res.json();
    setOrder(data.order);
  }

  useEffect(() => {
    load();
  }, [params.orderId]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProofImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  const current = order?.groups.find((g) => g.status === "AWAITING_CLAIM");
  const doneCount = order ? order.groups.length - order.groups.filter((g) => g.status === "AWAITING_CLAIM").length : 0;

  async function claim() {
    if (!current) return;
    setClaiming(true);
    try {
      const res = await fetch(`/api/order-groups/${current.id}/claim`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofImageUrl: proofImage }),
      });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      alert("Gagal menandai pembayaran, coba lagi.");
    } finally {
      setClaiming(false);
    }
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="spinner spinner-dark mx-auto mb-3" style={{ width: "24px", height: "24px", borderWidth: "3px" }} />
          <p className="font-display text-kerbau">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  const pending = order.groups.filter((g) => g.status === "AWAITING_CLAIM");
  if (pending.length === 0) {
    router.push(`/pesanan/${order.id}`);
    return null;
  }

  const currentGroup = current!;

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10">
      <div className="w-full max-w-sm">
        <a href="/pasar" className="text-sm text-kerbau hover:text-ink mb-4 inline-block">&larr; Kembali ke Pasar</a>
        <p className="text-xs text-kerbau text-center tracking-wide">
          Bayar kelompok {doneCount + 1} dari {order.groups.length}
        </p>
        <h1 className="font-display font-bold text-2xl text-ink text-center mt-1">
          {currentGroup.kelompok.name}
        </h1>
        <p className="text-[10px] text-kerbau/40 text-center mt-1">
          Dibuat oleh Dary Ikhsan, Fakultas Ilmu Komputer, UNIBA
        </p>

        <div className="bg-gabah/10 border border-gabah/20 rounded-lg p-3 mt-4 text-center">
          <p className="text-xs text-ink/70 leading-relaxed">
            <strong className="text-ink">Cara bayar:</strong> Scan QRIS dengan aplikasi bank/e-wallet kamu. Upload screenshot bukti transfer, lalu tekan &quot;Saya sudah bayar&quot;.
          </p>
        </div>

        <div className="border-2 border-dashed border-kerbau/25 rounded-2xl mt-6 pt-6 pb-6 px-6 text-center bg-white">
          <p className="text-sm text-kerbau">Scan QRIS ini untuk bayar</p>
          <div className="mt-4 flex justify-center">
            {currentGroup.kelompok.qrisImageUrl ? (
              <img
                src={currentGroup.kelompok.qrisImageUrl}
                alt={`QRIS ${currentGroup.kelompok.name}`}
                className="w-52 h-52 object-contain"
              />
            ) : (
              <p className="text-sm text-red-600 py-10">QRIS belum diisi panitia kelompok ini.</p>
            )}
          </div>
          <ul className="text-left text-sm text-ink mt-5 space-y-1">
            {currentGroup.items.map((it) => (
              <li key={it.id} className="flex justify-between">
                <span>{it.qty}× {it.product.name}</span>
                <span className="tabular text-kerbau">
                  Rp{(it.priceAtOrder * it.qty).toLocaleString("id-ID")}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between font-display font-semibold text-ink mt-3 pt-3 border-t border-kerbau/15">
            <span>Subtotal</span>
            <span className="tabular text-gabah">Rp{currentGroup.subtotal.toLocaleString("id-ID")}</span>
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-sm text-kerbau mb-2">Upload screenshot bukti pembayaran (wajib)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="text-sm"
          />
          {proofImage && (
            <div className="mt-2">
              <img src={proofImage} alt="Bukti pembayaran" className="w-full max-h-48 object-contain rounded-xl border border-kerbau/15 mx-auto" />
              <p className="text-xs text-paddy text-center mt-1">✓ Bukti terlampir</p>
            </div>
          )}
        </div>

        <button
          onClick={claim}
          disabled={claiming || !proofImage}
          className="w-full bg-paddy text-cream rounded-xl py-3.5 font-medium mt-5 disabled:opacity-40"
        >
          {claiming ? <span className="spinner inline-block mr-1" /> : null}
          {claiming ? "Memproses..." : "Saya sudah bayar"}
        </button>
        {!proofImage && (
          <p className="text-xs text-red-500 text-center mt-2">
            Upload screenshot terlebih dahulu untuk melanjutkan.
          </p>
        )}
        <p className="text-xs text-kerbau text-center mt-3">
          Setelah semua kelompok dibayar, panitia akan mengonfirmasi pembayaranmu.
        </p>
      </div>
    </div>
  );
}
