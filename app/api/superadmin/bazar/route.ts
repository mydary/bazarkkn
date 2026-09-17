import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const setting = await prisma.bazarSetting.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({ isOpen: setting?.isOpen ?? false });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { isOpen } = await req.json();
  const setting = await prisma.bazarSetting.upsert({
    where: { id: "singleton" },
    update: { isOpen },
    create: { id: "singleton", isOpen },
  });
  return NextResponse.json({ isOpen: setting.isOpen });
}
