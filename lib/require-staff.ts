import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

/**
 * Pastikan request datang dari panitia yang login. Return session + kelompokId
 * kalau valid, atau NextResponse 401 kalau belum login.
 */
export async function requireStaff() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { error: NextResponse.json({ error: "Belum login" }, { status: 401 }) };
  }
  return { session, kelompokId: (session.user as any).kelompokId as string };
}
