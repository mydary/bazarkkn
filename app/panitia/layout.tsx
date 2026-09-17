import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import PanitiaNav from "./nav";

export default async function PanitiaLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/panitia");
  if ((session.user as any)?.role === "SUPERADMIN") redirect("/superadmin");

  return (
    <div className="min-h-screen bg-anyaman text-ink">
      <PanitiaNav
        staffName={(session.user as any).name}
        kelompokName={(session.user as any).kelompokName}
      />
      <div className="max-w-3xl mx-auto p-5">{children}</div>
    </div>
  );
}
