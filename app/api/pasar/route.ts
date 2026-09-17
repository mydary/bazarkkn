import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/pasar -- daftar semua kelompok + kategori + produk (tanpa imageUrl untuk keep response kecil)
export async function GET() {
  const kelompokList = await prisma.kelompok.findMany({
    include: {
      categories: {
        orderBy: { sortOrder: "asc" },
        include: {
          products: {
            where: { isAvailable: true },
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              imageUrl: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Strip base64 data from imageUrl to keep response small;
  // client will fetch images separately via /api/pasar/image/[id]
  const stripped = kelompokList.map((k) => ({
    ...k,
    categories: k.categories.map((c) => ({
      ...c,
      products: c.products.map((p) => ({
        ...p,
        imageUrl: p.imageUrl ? `/api/pasar/image/${p.id}` : null,
      })),
    })),
  }));

  return NextResponse.json({ kelompokList: stripped });
}
