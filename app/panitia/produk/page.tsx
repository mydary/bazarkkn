"use client";

import { useEffect, useRef, useState } from "react";

type Category = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  categoryId: string;
  category: Category;
};

function resizeImage(file: File, maxDim = 640, quality = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
          else { w = Math.round(w * maxDim / h); h = maxDim; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function PanitiaProdukPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ categoryId: "", name: "", description: "", price: "", imageUrl: "" });
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const [catsRes, prodRes] = await Promise.all([
      fetch("/api/panitia/categories"),
      fetch("/api/panitia/products"),
    ]);
    setCategories((await catsRes.json()).categories ?? []);
    setProducts((await prodRes.json()).products ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    const resized = await resizeImage(file);
    setForm((prev) => ({ ...prev, imageUrl: resized }));
    setCompressing(false);
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!form.categoryId || !form.name || !form.price) return;
    setAdding(true);
    await fetch("/api/panitia/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ categoryId: "", name: "", description: "", price: "", imageUrl: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setAdding(false);
    load();
  }

  async function toggleAvailable(p: Product) {
    setTogglingId(p.id);
    await fetch(`/api/panitia/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !p.isAvailable }),
    });
    setTogglingId(null);
    load();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Hapus produk ini?")) return;
    setDeleting(id);
    await fetch(`/api/panitia/products/${id}`, { method: "DELETE" });
    setDeleting(null);
    load();
  }

  const inputClass =
    "w-full border border-kerbau/20 rounded-lg px-3.5 py-2.5 text-sm bg-white outline-none focus:border-gabah";

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-display font-semibold text-xl text-ink mb-1">Produk</h1>
        <p className="text-sm text-kerbau mb-3">Kelola daftar produk kelompokmu. Kategori sudah ditetapkan.</p>

        <div className="bg-gabah/10 border border-gabah/20 rounded-lg p-3 mb-4">
          <p className="text-xs text-ink/70 leading-relaxed">
            <strong className="text-ink">Cara pakai:</strong> Pilih kategori, isi nama & harga, upload foto produk (otomatis dikompres). Tekan &quot;Tambah produk&quot;. Atur ketersediaan dengan tombol &quot;Tersedia/Habis&quot;.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map((c) => (
            <span key={c.id} className="px-3 py-1 bg-white border border-kerbau/15 rounded-full text-sm">
              {c.name}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg text-ink mb-3">Tambah produk</h2>
        <form onSubmit={addProduct} className="space-y-2.5 border border-kerbau/10 rounded-xl p-4 bg-white">
          <select
            className={inputClass}
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            disabled={adding}
          >
            <option value="">Pilih kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            className={inputClass}
            placeholder="Nama produk"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={adding}
          />
          <input
            className={inputClass}
            placeholder="Deskripsi (opsional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            disabled={adding}
          />
          <div>
            <label className="block text-sm text-kerbau mb-1.5">Foto produk (opsional)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="text-sm"
              disabled={adding || compressing}
            />
            {compressing && <p className="text-xs text-kerbau mt-1">Mengkompres gambar...</p>}
            {form.imageUrl && (
              <img src={form.imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg mt-2" />
            )}
          </div>
          <input
            type="number"
            className={inputClass}
            placeholder="Harga (Rp)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            disabled={adding}
          />
          <button
            type="submit"
            disabled={adding || compressing}
            className="bg-paddy text-cream px-4 py-2.5 rounded-lg text-sm font-medium w-full disabled:opacity-50"
          >
            {adding ? <span className="spinner inline-block mr-1" /> : null}
            {adding ? "Menambahkan..." : "Tambah produk"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-lg text-ink mb-3">Daftar produk</h2>
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="border border-kerbau/10 rounded-xl p-3.5 bg-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-14 h-14 object-cover rounded-lg" />
                ) : (
                  <div className="w-14 h-14 bg-anyaman-soft rounded-lg flex items-center justify-center">
                    <span className="text-kerbau/30 text-xl">📦</span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-ink">{p.name}</p>
                  <p className="text-xs text-kerbau mt-0.5">
                    {p.category.name} · Rp{p.price.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <button
                  onClick={() => toggleAvailable(p)}
                  disabled={togglingId === p.id}
                  className={`px-2.5 py-1 rounded-full text-xs disabled:opacity-50 ${
                    p.isAvailable ? "bg-paddy/10 text-paddy" : "bg-kerbau/10 text-kerbau"
                  }`}
                >
                  {togglingId === p.id ? <span className="spinner inline-block mr-1" style={{width:"12px",height:"12px",borderWidth:"2px"}} /> : null}
                  {togglingId === p.id ? "..." : p.isAvailable ? "Tersedia" : "Habis"}
                </button>
                <button
                  onClick={() => deleteProduct(p.id)}
                  disabled={deleting === p.id}
                  className="text-red-600 text-xs disabled:opacity-50"
                >
                  {deleting === p.id ? <span className="spinner-dark inline-block mr-1" /> : null}
                  {deleting === p.id ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && <p className="text-sm text-kerbau">Belum ada produk.</p>}
        </div>
      </section>
    </div>
  );
}
