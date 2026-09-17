import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/pasar/image/[id] -- return product image as response
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: { imageUrl: true },
  });

  if (!product?.imageUrl) {
    return new NextResponse("Not found", { status: 404 });
  }

  // imageUrl is a data URI like "data:image/jpeg;base64,..."
  const match = product.imageUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    return new NextResponse("Invalid image", { status: 500 });
  }

  const [, contentType, base64Data] = match;
  const buffer = Buffer.from(base64Data, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
