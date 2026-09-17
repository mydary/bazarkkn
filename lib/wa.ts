/**
 * Bikin teks pesan WhatsApp yang sudah terisi (untuk dikirim pembeli ke
 * kelompok penjual) dan link wa.me-nya. Pembeli tinggal tap "Kirim" di WhatsApp.
 */
export function buildWaMessage(params: {
  kelompokName: string;
  buyerName: string;
  buyerContact: string;
  deliveryMethod: "PICKUP" | "DELIVER";
  deliveryLocation?: string | null;
  items: { name: string; qty: number; priceAtOrder: number }[];
  subtotal: number;
}) {
  const lines: string[] = [];
  lines.push(`Halo panitia ${params.kelompokName}, saya baru saja memesan:`);
  lines.push("");
  for (const it of params.items) {
    lines.push(`- ${it.qty}x ${it.name} (Rp${(it.priceAtOrder * it.qty).toLocaleString("id-ID")})`);
  }
  lines.push("");
  lines.push(`Total: Rp${params.subtotal.toLocaleString("id-ID")}`);
  lines.push(`Atas nama: ${params.buyerName}`);
  lines.push(`Kontak: ${params.buyerContact}`);
  lines.push(
    params.deliveryMethod === "DELIVER"
      ? `Metode: Antar ke ${params.deliveryLocation ?? "-"}`
      : "Metode: Ambil sendiri di tenda"
  );
  lines.push("");
  lines.push("Pembayaran sudah saya lakukan lewat QRIS, mohon dikonfirmasi ya. Terima kasih!");
  return lines.join("\n");
}

/** Normalisasi nomor ke format 62xxxxxxxxxx yang dipakai wa.me */
export function normalizeWaNumber(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("62")) return digits;
  return digits;
}

export function buildWaLink(phone: string, message: string) {
  return `https://wa.me/${normalizeWaNumber(phone)}?text=${encodeURIComponent(message)}`;
}
