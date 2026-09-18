import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const setting = await prisma.bazarSetting.findUnique({ where: { id: "singleton" } });
  const isOpen = setting?.isOpen ?? false;
  const res = NextResponse.json({ isOpen });
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}
