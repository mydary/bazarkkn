"use client";

import { useEffect, useState } from "react";

export default function PengaturanPage() {
  const [qrisImageUrl, setQrisImageUrl] = useState<string | undefined>();
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function load() {
    const res = await fetch("/api/panitia/kelompok");
    const data = await res.json();
    setQrisImageUrl(data.kelompok?.qrisImageUrl ?? undefined);
    setWhatsappNumber(data.kelompok?.whatsappNumber ?? "");
  }

  useEffect(() => {
    load();
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setQrisImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/panitia/kelompok", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrisImageUrl, whatsappNumber }),
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="space-y-8 max-w-sm">
      <div>
        <h1 className="font-display font-semibold text-xl text-ink mb-1">Pengaturan</h1>
        <p className="text-sm text-kerbau mb-3">QRIS dan nomor WhatsApp kelompokmu untuk terima pesanan.</p>

        <div className="bg-gabah/10 border border-gabah/20 rounded-lg p-3 mb-4">
          <p className="text-xs text-ink/70 leading-relaxed">
            <strong className="text-ink">Cara pakai:</strong> Upload gambar QRIS supaya pembeli bisa scan saat bayar. Isi nomor WhatsApp agar pembeli bisa konfirmasi pembayaran langsung ke kamu.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm text-kerbau mb-2">Gambar QRIS</label>
        {qrisImageUrl && (
          <img src={qrisImageUrl} alt="QRIS" className="w-40 h-40 object-contain border border-kerbau/15 rounded-xl bg-white mb-3" />
        )}
        <input type="file" accept="image/*" onChange={handleFile} className="text-sm" />
      </div>

      <div>
        <label className="block text-sm text-kerbau mb-1.5">Nomor WhatsApp (untuk terima pesan pembeli)</label>
        <input
          className="w-full border border-kerbau/20 rounded-lg px-3.5 py-2.5 text-sm bg-white outline-none focus:border-gabah"
          placeholder="08xxxxxxxxxx"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full bg-paddy text-cream rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
      >
        {saving ? <span className="spinner inline-block mr-1" /> : null}
        {saving ? "Menyimpan..." : "Simpan"}
      </button>
      {saved && <p className="text-sm text-paddy">Tersimpan.</p>}
    </div>
  );
}
