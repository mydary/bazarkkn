import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";

export async function GET() {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const kelompok = await prisma.kelompok.findUnique({ where: { id: auth.kelompokId } });
  return NextResponse.json({ kelompok });
}

// PATCH -- update QRIS (dikirim sebagai data URL base64 dari browser) & nomor WA
export async function PATCH(req: NextRequest) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.qrisImageUrl !== undefined) data.qrisImageUrl = body.qrisImageUrl;
  if (body.whatsappNumber !== undefined) data.whatsappNumber = body.whatsappNumber;
  if (body.name !== undefined) data.name = body.name;

  const kelompok = await prisma.kelompok.update({ where: { id: auth.kelompokId }, data });
  return NextResponse.json({ kelompok });
}
