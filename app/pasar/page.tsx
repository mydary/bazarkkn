"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "../cart-context";

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
};
type Category = { id: string; name: string; products: Product[] };
type Kelompok = { id: string; name: string; slug: string; categories: Category[] };

export default function PasarPage() {
  const [kelompokList, setKelompokList] = useState<Kelompok[]>([]);
  const [loading, setLoading] = useState(true);
  const [bazarOpen, setBazarOpen] = useState<boolean | null>(null);
  const { lines, addToCart, totalCount, totalPrice } = useCart();

  useEffect(() => {
    Promise.all([
      fetch("/api/pasar").then((r) => r.json()),
      fetch("/api/bazar-status").then((r) => r.json()),
    ]).then(([pasarData, statusData]) => {
      setKelompokList(pasarData.kelompokList ?? []);
      setBazarOpen(statusData.isOpen);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="spinner spinner-dark mx-auto mb-3" style={{width:"24px",height:"24px",borderWidth:"3px"}} />
          <p className="font-display text-kerbau">Menyiapkan pasar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      <header className="bg-paddy px-5 pt-6 pb-5 border-b-4 border-gabah">
        <img
          src="/images/logo.png"
          alt="Bazar KKN"
          className="w-full h-auto"
        />
      </header>

      {bazarOpen === false && (
        <div className="max-w-lg mx-auto px-3 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="font-display font-semibold text-red-700">Bazar Sedang Tutup</p>
            <p className="text-sm text-red-500 mt-1">Pemesanan belum tersedia saat ini. Nantikan info selanjutnya!</p>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-3 pt-3">
        <div className="bg-gabah/10 border border-gabah/20 rounded-lg p-3 mb-2">
          <p className="text-xs text-ink/70 leading-relaxed">
            <strong className="text-ink">Cara pakai:</strong> Pilih produk yang diinginkan, tekan &quot;+ Keranjang&quot;. Atur jumlah di keranjang. Setelah selesai, tekan tombol keranjang di bawah untuk checkout.
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-3">
        {kelompokList.map((k) => {
          const activeCategories = k.categories.filter((cat) => cat.products.length > 0);
          if (activeCategories.length === 0) return null;
          return (
          <section key={k.id} className="pt-5">
            <h2 className="font-display text-lg text-paddy mb-3 px-1">{k.name}</h2>
            {activeCategories.map((cat) => (
              <div key={cat.id} className="mb-4">
                <h3 className="text-xs font-medium text-kerbau mb-2 px-1">{cat.name}</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {cat.products.map((p) => {
                    const inCart = lines.find((l) => l.product.id === p.id);
                    return (
                      <div
                        key={p.id}
                        className="bg-white rounded-xl border border-kerbau/10 overflow-hidden"
                      >
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-full aspect-square object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full aspect-square bg-anyaman-soft flex items-center justify-center">
                            <span className="font-display text-3xl text-kerbau/20">{p.name[0]}</span>
                          </div>
                        )}
                        <div className="p-2.5">
                          <p className="font-medium text-ink text-sm leading-tight line-clamp-1">{p.name}</p>
                          <p className="tabular text-xs text-gabah font-medium mt-1">
                            Rp{p.price.toLocaleString("id-ID")}
                          </p>
                          <button
                            onClick={() =>
                              addToCart({
                                id: p.id,
                                name: p.name,
                                price: p.price,
                                kelompokId: k.id,
                                kelompokName: k.name,
                              })
                            }
                            disabled={bazarOpen === false}
                            className={`w-full mt-2 rounded-lg py-1.5 text-xs font-medium ${
                              bazarOpen === false
                                ? "bg-kerbau/10 text-kerbau cursor-not-allowed"
                                : inCart
                                  ? "bg-paddy text-cream"
                                  : "bg-gabah/15 text-gabah border border-gabah/20"
                            }`}
                            aria-label={`Tambah ${p.name}`}
                          >
                            {bazarOpen === false ? "Tutup" : inCart ? `${inCart.qty} di keranjang` : "+ Keranjang"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        )})}
      </div>

      {totalCount > 0 && bazarOpen !== false && (
        <div className="fixed bottom-0 left-0 right-0">
          <div className="max-w-lg mx-auto px-3 pb-4">
            <Link
              href="/cart"
              className="w-full bg-paddy text-cream rounded-xl py-4 px-5 flex items-center justify-between shadow-xl shadow-black/20"
            >
              <span className="text-sm">{totalCount} item di keranjang</span>
              <span className="font-display font-semibold tabular">
                Rp{totalPrice.toLocaleString("id-ID")}
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
