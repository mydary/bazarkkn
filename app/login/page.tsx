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
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-paddy flex items-center justify-center px-6">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
