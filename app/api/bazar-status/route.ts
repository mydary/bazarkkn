import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const setting = await prisma.bazarSetting.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({ isOpen: setting?.isOpen ?? false }, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}
