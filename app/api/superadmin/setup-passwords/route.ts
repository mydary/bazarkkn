import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const PASSWORDS: Record<string, string> = {
  kelompok19: "Bazar19HRhk!",
  kelompok20: "Bazar20XEEQ!",
  kelompok21: "Bazar21FCP9!",
  kelompok22: "Bazar22U8AH!",
  kelompok23: "Bazar23DN6d!",
  kelompok24: "Bazar24GLQy!",
  kelompok25: "Bazar25vcGT!",
};

export async function POST() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const results: { username: string; password: string }[] = [];

  for (const [username, password] of Object.entries(PASSWORDS)) {
    const hash = await bcrypt.hash(password, 10);
    await prisma.staffUser.update({
      where: { username },
      data: { passwordHash: hash },
    });
    results.push({ username, password });
  }

  return NextResponse.json({ ok: true, passwords: results });
}
