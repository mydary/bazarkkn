"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CartProduct = {
  id: string;
  name: string;
  price: number;
  kelompokId: string;
  kelompokName: string;
};
export type CartLine = { product: CartProduct; qty: number };

type CartContextValue = {
  lines: CartLine[];
  addToCart: (product: CartProduct) => void;
  removeOne: (productId: string) => void;
  clear: () => void;
  totalCount: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "bazar-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // biarkan cart kosong kalau data tersimpan rusak
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // storage penuh/tidak tersedia -- keranjang tetap jalan di memori
    }
  }, [lines, hydrated]);

  function addToCart(product: CartProduct) {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) => (l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { product, qty: 1 }];
    });
  }

  function removeOne(productId: string) {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === productId);
      if (!existing) return prev;
      if (existing.qty <= 1) return prev.filter((l) => l.product.id !== productId);
      return prev.map((l) => (l.product.id === productId ? { ...l, qty: l.qty - 1 } : l));
    });
  }

  function clear() {
    setLines([]);
  }

  const totalCount = lines.reduce((sum, l) => sum + l.qty, 0);
  const totalPrice = lines.reduce((sum, l) => sum + l.qty * l.product.price, 0);

  return (
    <CartContext.Provider value={{ lines, addToCart, removeOne, clear, totalCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart harus dipakai di dalam CartProvider");
  return ctx;
}
