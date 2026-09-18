"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/panitia";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { username, password, redirect: false });
    if (res?.error) {
      setLoading(false);
      setError("Username atau password salah.");
      return;
    }
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role;
    if (role === "SUPERADMIN") {
      router.push("/superadmin");
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <p className="text-xs text-cream/60 text-center tracking-wide">Area panitia</p>
      <h1 className="font-display font-bold text-2xl text-cream text-center mt-1 mb-8">Masuk</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-cream/70 mb-1.5">Username</label>
          <input
            className="w-full bg-paddy-deep border border-cream/15 rounded-lg px-3.5 py-2.5 text-cream outline-none focus:border-gabah"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-cream/70 mb-1.5">Password</label>
          <input
            type="password"
            className="w-full bg-paddy-deep border border-cream/15 rounded-lg px-3.5 py-2.5 text-cream outline-none focus:border-gabah"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-300">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gabah text-ink rounded-lg py-2.5 font-medium mt-2"
        >
          {loading ? <span className="spinner inline-block mr-1" style={{width:"14px",height:"14px",borderWidth:"2px"}} /> : null}
          {loading ? "Masuk..." : "Masuk"}
        </button>
      </form>
      <a
        href="https://wa.me/6285782451102?text=Halo%20Ikhsan%2C%20saya%20lupa%20password%20akun%20panitia%20saya.%20Bisa%20dibantu%20untuk%20mengatur%20ulang%3F"
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-xs text-cream/50 hover:text-cream/80 mt-4"
      >
        Lupa password? Hubungi admin
      </a>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-paddy flex flex-col items-center justify-center px-6">
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="text-[10px] text-cream/30 mt-8 text-center">
        Dibuat oleh Dary Ikhsan, Fakultas Ilmu Komputer, UNIBA
      </p>
    </div>
  );
}
