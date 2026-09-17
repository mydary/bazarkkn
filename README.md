# Pasar Bazar Kelompok KKN — Starter

Aplikasi order digital untuk bazar penutupan KKN dengan 7 kelompok, masing-masing
jualan produk sendiri dengan QRIS sendiri. Dibangun dengan mengadaptasi codebase
sistem dine-in-qr sebelumnya (Next.js + Prisma + NextAuth + Pusher), bukan dari nol.

## Alur pembeli

1. Scan **satu QR** yang ditempel di gerbang masuk bazar → masuk ke `/pasar`.
2. Lihat produk semua kelompok (tab per kelompok), tambah ke keranjang — boleh
   campur produk dari beberapa kelompok sekaligus.
3. Di `/cart`: isi nama, nomor WhatsApp, dan pilih **ambil di tenda** atau
   **antar ke sini** (kalau antar, wajib isi lokasi/nomor tenda).
4. Di `/bayar/[id]`: sistem menampilkan QRIS **satu per satu** untuk tiap
   kelompok yang terlibat ("Bayar kelompok 1 dari 3", dst). Setelah scan &
   bayar, pembeli tap **"Saya sudah bayar"**, lanjut ke kelompok berikutnya.
5. Di `/pesanan/[id]`: status tiap kelompok terlihat terpisah. Ada tombol
   **kirim konfirmasi ke WhatsApp** (link `wa.me` dengan pesan sudah terisi,
   pembeli tinggal tap kirim). Setelah panitia kelompok konfirmasi, barcode
   pengambilan muncul (kalau pilih ambil di tenda) atau catatan lokasi antar
   (kalau pilih antar).

## Alur panitia

1. Panitia tiap kelompok punya akun sendiri (`/login`), hanya melihat data
   kelompoknya sendiri.
2. `/panitia` — antrean: **Menunggu konfirmasi** (klaim bayar dari pembeli,
   tombol "Konfirmasi bayar" / "Belum masuk"), **Siap diambil/diantar**
   (tombol "Tandai selesai"), riwayat selesai.
3. Barcode yang didapat pembeli sebenarnya adalah link ke `/verify/[token]` —
   discan pakai kamera HP biasa (bukan aplikasi khusus), dan otomatis
   menampilkan detail pesanan + tombol aksi yang sesuai statusnya. Jadi
   konfirmasi bisa lewat dashboard **atau** lewat scan barcode saat pembeli
   datang ke tenda.
4. `/panitia/produk` — kelola kategori & produk kelompok.
5. `/panitia/pengaturan` — upload gambar QRIS kelompok (disimpan langsung di
   database sebagai gambar, tidak perlu hosting terpisah) dan nomor WhatsApp
   untuk terima pesan dari pembeli.

## Kenapa desainnya begini

- **QRIS statis per kelompok**, bukan payment gateway — karena tiap kelompok
  memang sudah punya QRIS masing-masing, tidak perlu (dan tidak praktis)
  bikin satu akun payment gateway terpusat untuk acara sekali jalan.
- **Konfirmasi manual panitia**, bukan otomatis — konsekuensi wajar dari QRIS
  statis: sistem tidak bisa tahu otomatis kalau uang sudah masuk. Verifikasi
  fisik oleh panitia (cek mutasi/notifikasi e-wallet mereka) tetap diperlukan.
- **Barcode = link, bukan format QR khusus** — bisa discan pakai kamera HP
  bawaan siapa saja, tidak perlu instal aplikasi scanner terpisah.

## Menjalankan project

1. Install dependency:
   ```bash
   npm install
   ```
2. Salin `.env.example` menjadi `.env`, isi `DATABASE_URL` (Postgres, bisa
   pakai Supabase/Railway gratis), `NEXTAUTH_SECRET`, dan env Pusher (daftar
   gratis di pusher.com untuk update status real-time).
3. Migrasi database:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Buat 7 kelompok + akun panitia masing-masing:
   ```bash
   node scripts/create-kelompok.js "Kelompok 1 - Kerajinan Batik" kelompok-1
   node scripts/create-staff.js <kelompokId-yang-muncul> "Nama Panitia" usernamenya passwordnya
   ```
   (ulangi untuk 7 kelompok)
5. Login tiap kelompok di `/login`, lalu lengkapi produk (`/panitia/produk`)
   dan QRIS + nomor WA (`/panitia/pengaturan`) lewat akun masing-masing.
6. Cetak satu QR untuk gerbang masuk bazar:
   ```bash
   node scripts/print-entry-qr.js
   ```
7. Jalankan development server:
   ```bash
   npm run dev
   ```

## Struktur penting

- `app/pasar/page.tsx` — pasar digital (halaman yang dibuka dari QR masuk).
- `app/produk/[id]/page.tsx` — detail produk.
- `app/cart/page.tsx` — keranjang + data diri pembeli + metode ambil/antar.
- `app/bayar/[orderId]/page.tsx` — tampilkan QRIS bergantian per kelompok.
- `app/pesanan/[orderId]/page.tsx` — status pesanan, link WA, barcode ambil.
- `app/panitia/*` — dashboard panitia (antrean, produk, pengaturan) — butuh login.
- `app/verify/[token]/page.tsx` — halaman hasil scan barcode (staff-only).
- `app/api/*` — semua endpoint backend.
- `lib/wa.ts` — bikin teks pesan WhatsApp otomatis + link `wa.me`.
- `prisma/schema.prisma` — Kelompok, Category, Product, Order, OrderGroup (per kelompok), OrderItem, StaffUser.

## Yang masih perlu ditambahkan sebelum dipakai di acara

1. Data 7 kelompok, produk, QRIS, dan nomor WA harus diisi manual sebelum hari-H (lewat langkah 4–5 di atas).
2. Belum ada laporan rekap penjualan per kelompok — bisa ditambahkan mirip pola laporan di proyek dine-in-qr sebelumnya kalau dibutuhkan.
3. Uji alur penuh sekali sebelum acara: dari scan QR sampai barcode di-scan panitia, supaya tidak ada kejutan pas hari-H.
4. Sebelum online: generate `NEXTAUTH_SECRET` yang baru & rahasia, deploy ke Vercel + database production.
