"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const LINKS = [
  { href: "/panitia", label: "Antrean" },
  { href: "/panitia/produk", label: "Produk" },
  { href: "/panitia/pengaturan", label: "Pengaturan" },
];

export default function PanitiaNav({ staffName, kelompokName }: { staffName: string; kelompokName: string }) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  return (
    <nav className="border-b border-kerbau/10 bg-white px-5 py-4">
      <div className="flex items-center justify-between mb-1">
        <span className="font-display font-semibold text-paddy">{kelompokName}</span>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-kerbau">{staffName}</span>
          <button
            onClick={() => { setLoggingOut(true); signOut({ callbackUrl: "/login" }); }}
            disabled={loggingOut}
            className="text-paddy disabled:opacity-50"
          >
            {loggingOut ? <span className="spinner inline-block mr-1" style={{width:"12px",height:"12px",borderWidth:"2px"}} /> : null}
            {loggingOut ? "Keluar..." : "Keluar"}
          </button>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`text-sm pb-0.5 border-b-2 ${
              pathname === l.href ? "border-gabah text-ink" : "border-transparent text-kerbau"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
