import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function SuperadminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/superadmin");
  if ((session.user as any)?.role !== "SUPERADMIN") redirect("/login");
  return <>{children}</>;
}
