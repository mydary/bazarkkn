import "./globals.css";
import type { ReactNode } from "react";
import { Bitter, Plus_Jakarta_Sans } from "next/font/google";
import Providers from "./providers";

const bitter = Bitter({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-bitter",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

export const metadata = {
  title: "Pasar Bazar",
  description: "Pesan produk bazar langsung dari HP kamu",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${bitter.variable} ${jakarta.variable}`}>
      <body className="bg-anyaman text-ink font-sans min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
