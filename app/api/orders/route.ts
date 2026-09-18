import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CartLine = { productId: string; qty: number; notes?: string };

// POST /api/orders
// body: { buyerName, buyerContact, deliveryMethod, deliveryLocation?, items: CartLine[] }
// Item dari kelompok berbeda otomatis dikelompokkan jadi OrderGroup terpisah,
// masing-masing punya QRIS & barcode ambil sendiri.
export async function POST(req: NextRequest) {
  const bazar = await prisma.bazarSetting.findUnique({ where: { id: "singleton" } });
  if (bazar && !bazar.isOpen) {
    return NextResponse.json({ error: "Bazar sedang tutup" }, { status: 403 });
  }

  const body = await req.json();
  const { buyerName, buyerContact, deliveryMethod, deliveryLocation, items } = body as {
    buyerName: string;
    buyerContact: string;
    deliveryMethod: "PICKUP" | "DELIVER";
    deliveryLocation?: string;
    items: CartLine[];
  };

  if (!buyerName || !buyerContact || !items?.length) {
    return NextResponse.json({ error: "Data pesanan tidak lengkap" }, { status: 400 });
  }
  if (deliveryMethod === "DELIVER" && !deliveryLocation) {
    return NextResponse.json({ error: "Lokasi/nomor tenda wajib diisi untuk antar" }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });

  // Kelompokkan item berdasarkan kelompokId
  const byKelompok = new Map<string, { productId: string; qty: number; notes?: string; price: number }[]>();
  for (const line of items) {
    const product = products.find((p) => p.id === line.productId);
    if (!product) continue;
    const arr = byKelompok.get(product.kelompokId) ?? [];
    arr.push({ productId: product.id, qty: line.qty, notes: line.notes, price: product.price });
    byKelompok.set(product.kelompokId, arr);
  }

  if (byKelompok.size === 0) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  const order = await prisma.order.create({
    data: {
      buyerName,
      buyerContact,
      deliveryMethod,
      deliveryLocation: deliveryMethod === "DELIVER" ? deliveryLocation : null,
      groups: {
        create: Array.from(byKelompok.entries()).map(([kelompokId, lines]) => ({
          kelompokId,
          subtotal: lines.reduce((sum, l) => sum + l.price * l.qty, 0),
          items: {
            create: lines.map((l) => ({
              productId: l.productId,
              qty: l.qty,
              priceAtOrder: l.price,
              notes: l.notes,
            })),
          },
        })),
      },
    },
    include: { groups: { include: { items: true, kelompok: true } } },
  });

  return NextResponse.json({ order });
}
