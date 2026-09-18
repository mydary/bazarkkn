"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

type Stats = {
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalKelompok: number;
  recentOrders: {
    id: string;
    buyerName: string;
    createdAt: string;
    groups: { subtotal: number; status: string; kelompok: { name: string } }[];
  }[];
  kelompokRevenue: {
    name: string;
    productCount: number;
    revenue: number;
    orderCount: number;
    completedCount: number;
  }[];
  categoryRevenue: { name: string; revenue: number; qty: number }[];
};

const STATUS_TEXT: Record<string, string> = {
  AWAITING_CLAIM: "Belum bayar",
  WAITING_VERIFICATION: "Menunggu",
  VERIFIED: "Terverifikasi",
  COMPLETED: "Selesai",
  REJECTED: "Ditolak",
};

export default function SuperadminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [resetting, setResetting] = useState(false);

  const role = (session?.user as any)?.role;
  useEffect(() => {
    if (session !== undefined && role !== "SUPERADMIN") {
      router.push("/login");
    }
  }, [session, role, router]);

  async function loadStats() {
    try {
      const res = await fetch("/api/superadmin/stats");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadBazarStatus() {
    const res = await fetch("/api/superadmin/bazar");
    const data = await res.json();
    setIsOpen(data.isOpen);
  }

  useEffect(() => {
    if (role === "SUPERADMIN") {
      loadStats();
      loadBazarStatus();
    }
  }, [role]);

  async function toggleBazar() {
    setToggling(true);
    const next = !isOpen;
    try {
      const res = await fetch("/api/superadmin/bazar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isOpen: next }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Toggle bazar failed:", res.status, err);
        throw new Error("Failed");
      }
      const data = await res.json();
      setIsOpen(data.isOpen);
    } catch {
      setIsOpen(!next);
    } finally {
      setToggling(false);
    }
  }

  async function resetDatabase() {
    const confirm1 = window.confirm("Reset akan menghapus SEMUA produk, pesanan, QRIS, dan nomor WhatsApp. Akun panitia TIDAK akan dihapus. Lanjutkan?");
    if (!confirm1) return;
    const confirm2 = window.confirm("Apakah kamu yakin? Data yang sudah dihapus tidak bisa dikembalikan.");
    if (!confirm2) return;
    setResetting(true);
    await fetch("/api/superadmin/reset", { method: "POST" });
    setIsOpen(false);
    await loadStats();
    setResetting(false);
    alert("Database berhasil direset.");
  }

  if (role !== "SUPERADMIN") return null;

  return (
    <div className="min-h-screen bg-anyaman">
      <nav className="bg-paddy px-5 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-cream text-lg">Superadmin</h1>
            <p className="text-cream/60 text-xs">{(session?.user as any)?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/pasar" className="text-cream/60 text-sm hover:text-cream">
              Lihat Pasar
            </a>
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-cream/60 text-sm hover:text-cream">
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-5 py-6 space-y-6">

        <div className="bg-white rounded-xl border border-kerbau/10 p-5">
          <h2 className="font-display font-semibold text-ink mb-1">Status Bazar</h2>
          <p className="text-sm text-kerbau mb-4">
            Buka atau tutup pasar digital. Saat ditutup, pembeli tidak bisa melakukan pemesanan.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleBazar}
              disabled={toggling}
              className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                isOpen ? "bg-paddy" : "bg-kerbau/30"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${
                  isOpen ? "translate-x-7" : ""
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isOpen ? "text-paddy" : "text-kerbau"}`}>
              {isOpen ? "Bazar Buka" : "Bazar Tutup"}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-red-200 p-5">
          <h2 className="font-display font-semibold text-red-700 mb-1">Reset Database</h2>
          <p className="text-sm text-kerbau mb-4">
            Hapus semua data produk, pesanan, QRIS, dan nomor WhatsApp. Akun panitia tetap aman.
          </p>
          <button
            onClick={resetDatabase}
            disabled={resetting}
            className="bg-red-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {resetting ? "Meriset..." : "Reset Semua Data"}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <span className="spinner spinner-dark mx-auto mb-3" style={{ width: "24px", height: "24px", borderWidth: "3px" }} />
            <p className="text-sm text-kerbau">Memuat statistik...</p>
          </div>
        ) : stats && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <StatCard label="Total Pesanan" value={stats.totalOrders} />
              <StatCard label="Total Pendapatan" value={`Rp${stats.totalRevenue.toLocaleString("id-ID")}`} />
              <StatCard label="Selesai" value={stats.completedOrders} />
              <StatCard label="Dalam Proses" value={stats.pendingOrders} />
              <StatCard label="Produk" value={stats.totalProducts} />
              <StatCard label="Kelompok" value={stats.totalKelompok} />
            </div>

            <div className="bg-white rounded-xl border border-kerbau/10 p-5">
              <h2 className="font-display font-semibold text-ink mb-4">Pendapatan per Kelompok</h2>
              {stats.kelompokRevenue.length === 0 ? (
                <p className="text-sm text-kerbau">Belum ada data.</p>
              ) : (
                <div className="space-y-3">
                  {stats.kelompokRevenue
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((k) => (
                      <div key={k.name} className="border-b border-kerbau/10 pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm text-ink">{k.name}</span>
                          <span className="text-sm font-semibold text-gabah tabular">Rp{k.revenue.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex gap-3 text-xs text-kerbau">
                          <span>{k.productCount} produk</span>
                          <span>{k.orderCount} pesanan</span>
                          <span>{k.completedCount} selesai</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {stats.categoryRevenue.length > 0 && (
              <div className="bg-white rounded-xl border border-kerbau/10 p-5">
                <h2 className="font-display font-semibold text-ink mb-4">Pendapatan per Kategori</h2>
                <div className="space-y-2">
                  {stats.categoryRevenue.map((c) => (
                    <div key={c.name} className="flex justify-between items-center border-b border-kerbau/10 pb-2 last:border-0 last:pb-0">
                      <span className="text-sm text-ink">{c.name}</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gabah tabular">Rp{c.revenue.toLocaleString("id-ID")}</span>
                        <span className="text-xs text-kerbau ml-2">({c.qty} terjual)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-kerbau/10 p-5">
              <h2 className="font-display font-semibold text-ink mb-4">Pesanan Terbaru</h2>
              {stats.recentOrders.length === 0 ? (
                <p className="text-sm text-kerbau">Belum ada pesanan.</p>
              ) : (
                <div className="space-y-2">
                  {stats.recentOrders.map((o) => {
                    const total = o.groups.reduce((s, g) => s + g.subtotal, 0);
                    return (
                      <div key={o.id} className="border-b border-kerbau/10 pb-2 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-ink">{o.buyerName}</p>
                            <p className="text-xs text-kerbau">
                              {o.groups.map((g) => g.kelompok.name).join(", ")} ·{" "}
                              {new Date(o.createdAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gabah tabular">Rp{total.toLocaleString("id-ID")}</p>
                            <div className="flex gap-1 mt-0.5">
                              {o.groups.map((g, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-anyaman text-kerbau">
                                  {STATUS_TEXT[g.status] ?? g.status}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-kerbau/10 p-4">
      <p className="text-xs text-kerbau mb-1">{label}</p>
      <p className="font-display font-bold text-ink text-lg">{value}</p>
    </div>
  );
}
