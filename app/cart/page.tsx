"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../cart-context";

export default function CartPage() {
  const router = useRouter();
  const { lines, addToCart, removeOne, totalPrice, clear } = useCart();
  const [buyerName, setBuyerName] = useState("");
  const [buyerContact, setBuyerContact] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"PICKUP" | "DELIVER">("PICKUP");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [bazarOpen, setBazarOpen] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/bazar-status").then((r) => r.json()).then((d) => setBazarOpen(d.isOpen));
  }, []);

  const byKelompok = new Map<string, { kelompokName: string; lines: typeof lines }>();
  for (const line of lines) {
    const entry = byKelompok.get(line.product.kelompokId) ?? {
      kelompokName: line.product.kelompokName,
      lines: [],
    };
    entry.lines.push(line);
    byKelompok.set(line.product.kelompokId, entry);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (deliveryMethod === "DELIVER" && !deliveryLocation.trim()) {
      setError("Isi lokasi pengantaran kamu dulu ya.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName,
          buyerContact,
          deliveryMethod,
          deliveryLocation: deliveryMethod === "DELIVER" ? deliveryLocation : undefined,
          items: lines.map((l) => ({ productId: l.product.id, qty: l.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      clear();
      router.push(`/bayar/${data.order.id}`);
    } catch (err) {
      setError("Gagal membuat pesanan, coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="font-display text-lg text-ink mb-2">Keranjang masih kosong</p>
        <p className="text-sm text-kerbau mb-6">Yuk pilih produk dari kelompok favoritmu.</p>
        <button onClick={() => router.push("/pasar")} className="bg-paddy text-cream rounded-lg px-5 py-2.5 text-sm">
          Ke Pasar
        </button>
      </div>
    );
  }

  if (bazarOpen === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-sm">
          <p className="font-display font-semibold text-red-700 mb-1">Bazar Sedang Tutup</p>
          <p className="text-sm text-red-500 mb-4">Pesanan tidak dapat dibuat saat bazar tutup.</p>
          <button onClick={() => router.push("/pasar")} className="bg-paddy text-cream rounded-lg px-5 py-2.5 text-sm">
            Ke Pasar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto px-5 pb-10">
      <a href="/pasar" className="text-sm text-kerbau hover:text-ink mt-6 mb-2 inline-block">&larr; Kembali ke Pasar</a>
      <h1 className="font-display font-bold text-2xl text-ink mb-5">Keranjang</h1>

      <div className="bg-gabah/10 border border-gabah/20 rounded-lg p-3 mb-5">
        <p className="text-xs text-ink/70 leading-relaxed">
          <strong className="text-ink">Cara pakai:</strong> Atur jumlah item (+/−), isi nama & WhatsApp, pilih ambil sendiri atau diantar, lalu tekan &quot;Lanjut ke Pembayaran&quot;.
        </p>
      </div>

      {Array.from(byKelompok.entries()).map(([kelompokId, group]) => (
        <div key={kelompokId} className="mb-5">
          <p className="text-sm font-medium text-paddy mb-2">{group.kelompokName}</p>
          <div className="bg-white rounded-xl border border-kerbau/10 divide-y divide-kerbau/10">
            {group.lines.map((l) => (
              <div key={l.product.id} className="flex items-center justify-between px-3.5 py-3">
                <div>
                  <p className="text-sm text-ink">{l.product.name}</p>
                  <p className="tabular text-xs text-kerbau">
                    Rp{l.product.price.toLocaleString("id-ID")} × {l.qty}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => removeOne(l.product.id)} className="w-7 h-7 text-ink/70">−</button>
                  <span className="tabular w-4 text-center text-sm">{l.qty}</span>
                  <button onClick={() => addToCart(l.product)} className="w-7 h-7 text-ink/70">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-between font-display font-semibold text-ink text-lg py-3 border-t border-kerbau/15 mb-6">
        <span>Total</span>
        <span className="tabular text-gabah">Rp{totalPrice.toLocaleString("id-ID")}</span>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm text-kerbau mb-1.5">Nama kamu</label>
          <input
            className="w-full border border-kerbau/20 rounded-lg px-3.5 py-2.5 bg-white outline-none focus:border-gabah"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-kerbau mb-1.5">Nomor WhatsApp</label>
          <input
            className="w-full border border-kerbau/20 rounded-lg px-3.5 py-2.5 bg-white outline-none focus:border-gabah"
            placeholder="08xxxxxxxxxx"
            value={buyerContact}
            onChange={(e) => setBuyerContact(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm text-kerbau mb-1.5">Cara ambil pesanan</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDeliveryMethod("PICKUP")}
              className={`rounded-lg py-2.5 text-sm border ${
                deliveryMethod === "PICKUP" ? "bg-paddy text-cream border-paddy" : "bg-white border-kerbau/20 text-ink"
              }`}
            >
              Ambil sendiri
            </button>
            <button
              type="button"
              onClick={() => setDeliveryMethod("DELIVER")}
              className={`rounded-lg py-2.5 text-sm border ${
                deliveryMethod === "DELIVER" ? "bg-paddy text-cream border-paddy" : "bg-white border-kerbau/20 text-ink"
              }`}
            >
              Antar ke sini
            </button>
          </div>
        </div>

        {deliveryMethod === "DELIVER" && (
          <div>
            <label className="block text-sm text-kerbau mb-1.5">Lokasi pengantaran</label>
            <input
              className="w-full border border-kerbau/20 rounded-lg px-3.5 py-2.5 bg-white outline-none focus:border-gabah"
              placeholder="mis. Depan gerbang utama, dekat panggung"
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
            />
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gabah text-ink rounded-lg py-3.5 font-medium mt-2 disabled:opacity-50"
        >
          {submitting ? <span className="spinner-dark inline-block mr-1" /> : null}
          {submitting ? "Memproses..." : "Lanjut ke Pembayaran"}
        </button>
      </form>
    </div>
  );
}
