# Daftar Pengujian Sistem Bazar KKN

## 1. Autentikasi

| No | Skenario | Langkah | Hasil Expected | Status |
|---|---|---|---|---|
| 1.1 | Login panitia | Buka `/login` → masukkan `kelompok19` / `ciruas123` | Berhasil, redirect ke `/panitia` | |
| 1.2 | Login superadmin | Buka `/login` → masukkan `superadmin` / `bazar123` | Berhasil, redirect ke `/superadmin` | |
| 1.3 | Login gagal (password salah) | Masukkan password yang salah | Muncul error "Username atau password salah." | |
| 1.4 | Akses `/panitia` tanpa login | Buka `/panitia` langsung | Redirect ke `/login` | |
| 1.5 | Akses `/superadmin` tanpa login | Buka `/superadmin` langsung | Redirect ke `/login` | |
| 1.6 | Panitia akses `/superadmin` | Login sebagai kelompok, buka `/superadmin` | Ditolak / redirect | |
| 1.7 | Logout | Klik "Keluar" di halaman panitia/superadmin | Berhasil, kembali ke `/login` | |

---

## 2. Superadmin — Buka/Tutup Bazar

| No | Skenario | Langkah | Hasil Expected | Status |
|---|---|---|---|---|
| 2.1 | Toggle buka bazar | Login superadmin → klik switch "Bazar Tutup" | Switch berubah hijau, status "Bazar Buka" | |
| 2.2 | Toggle tutup bazar | Klik switch "Bazar Buka" | Switch berubah abu-abu, status "Bazar Tutup" | |
| 2.3 | Cek status di `/pasar` (buka) | Buka `/pasar` saat bazar buka | Tidak ada banner "Bazar Sedang Tutup" | |
| 2.4 | Cek status di `/pasar` (tutup) | Buka `/pasar` saat bazar tutup | Muncul banner "Bazar Sedang Tutup" | |
| 2.5 | Coba pesan saat tutup | Buka `/pasar` saat tutup → coba tambah ke keranjang | Tombol "+ Keranjang" disabled/tidak bisa diklik | |

---

## 3. Superadmin — Statistik

| No | Skenario | Langkah | Hasil Expected | Status |
|---|---|---|---|---|
| 3.1 | Lihat total pesanan | Login superadmin | Statistik menampilkan angka (awalnya 0) | |
| 3.2 | Lihat total pendapatan | Login superadmin | Menampilkan Rp0 atau sesuai data | |
| 3.3 | Lihat per kelompok | Scroll ke "Pendapatan per Kelompok" | Daftar kelompok dengan jumlah produk/pesanan | |
| 3.4 | Lihat per kategori | Scroll ke "Pendapatan per Kategori" | Daftar kategori dengan jumlah terjual | |
| 3.5 | Lihat pesanan terbaru | Scroll ke "Pesanan Terbaru" | Daftar 10 pesanan terakhir | |

---

## 4. Superadmin — Reset Database

| No | Skenario | Langkah | Hasil Expected | Status |
|---|---|---|---|---|
| 4.1 | Reset database | Login superadmin → klik "Reset Semua Data" | Muncul konfirmasi pertama | |
| 4.2 | Konfirmasi pertama | Klik OK | Muncul konfirmasi kedua | |
| 4.3 | Konfirmasi kedua | Klik OK | Semua data terhapus, akun panitia tetap ada | |
| 4.4 | Batal reset | Klik Cancel di salah satu konfirmasi | Tidak ada perubahan | |

---

## 5. Panitia — Kelola Produk

| No | Skenario | Langkah | Hasil Expected | Status |
|---|---|---|---|---|
| 5.1 | Lihat daftar produk | Login panitia → buka `/panitia/produk` | Daftar produk kelompok tampil | |
| 5.2 | Tambah produk | Pilih kategori, isi nama & harga, upload foto, klik "Tambah produk" | Produk berhasil ditambah, muncul di daftar | |
| 5.3 | Toggle stok habis | Klik tombol "Tersedia" pada produk | Berubah jadi "Habis" (abu-abu) | |
| 5.4 | Toggle stok tersedia | Klik tombol "Habis" pada produk | Berubah jadi "Tersedia" (hijau) | |
| 5.5 | Hapus produk | Klik "Hapus" pada produk → konfirmasi | Produk terhapus dari daftar | |
| 5.6 | Produk stok habis tidak tampil di pasar | Set produk "Habis" → buka `/pasar` | Produk tersebut tidak muncul | |

---

## 6. Pasar — Belanja

| No | Skenario | Langkah | Hasil Expected | Status |
|---|---|---|---|---|
| 6.1 | Lihat daftar produk | Buka `/pasar` | Produk per kelompok tampil dalam grid 2 kolom | |
| 6.2 | Filter per kelompok | Klik tombol kelompok | Hanya produk kelompok tersebut yang tampil | |
| 6.3 | Filter semua | Klik "Semua" | Semua produk tampil | |
| 6.4 | Tambah ke keranjang | Klik "+ Keranjang" pada produk | Keranjang bertambah, badge angka muncul | |
| 6.5 | Tambah qty | Klik "+" di keranjang | Qty bertambah, harga otomatis | |
| 6.6 | Kurangi qty | Klik "-" di keranjang | Qty berkurang | |
| 6.7 | Lanjut belanja | Klik "Lanjut belanja" | Kembali ke `/pasar` | |

---

## 7. Keranjang & Checkout

| No | Skenario | Langkah | Hasil Expected | Status |
|---|---|---|---|---|
| 7.1 | Lihat keranjang | Klik icon keranjang | Semua item, total harga, input lokasi | |
| 7.2 | Isi lokasi pengantaran | Ketik nama lokasi | Lokasi terisi | |
| 7.3 | Checkout tanpa lokasi | Kosongkan lokasi → klik "Buat Pesanan" | Error: lokasi wajib diisi | |
| 7.4 | Checkout berhasil | Isi lokasi → klik "Buat Pesanan" | Redirect ke halaman bayar | |

---

## 8. Pembayaran

| No | Skenario | Langkah | Hasil Expected | Status |
|---|---|---|---|---|
| 8.1 | Lihat QRIS | Buka halaman bayar | QRIS muncul sesuai kelompok penjual | |
| 8.2 | Lihat total bayar | Buka halaman bayar | Total sesuai pesanan | |
| 8.3 | Upload bukti bayar | Pilih foto screenshot bukti transfer | Foto terupload, preview muncul | |
| 8.4 | Klik "Saya sudah bayar" tanpa upload | Klik tombol tanpa upload foto | Tombol disabled atau error | |
| 8.5 | Klik "Saya sudah bayar" dengan upload | Upload foto → klik tombol | Status berubah jadi "Diverifikasi", tombol berubah | |

---

## 9. Panitia — Verifikasi Pesanan

| No | Skenario | Langkah | Hasil Expected | Status |
|---|---|---|---|---|
| 9.1 | Lihat antrean | Login panitia → `/panitia` | Pesanan masuk tampil di antrean | |
| 9.2 | Lihat bukti bayar | Klik "Lihat Bukti" pada pesanan | Gambar bukti transfer muncul | |
| 9.3 | Klaim pesanan | Klik "Klaim" pada pesanan | Status berubah, nama panitia muncul | |
| 9.4 | Tolak pesanan | Klik "Tolak" pada pesanan | Status berubah jadi "Ditolak" | |
| 9.5 | Selesaikan pesanan | Klik "Selesai" pada pesanan yang diklaim | Status berubah jadi "Selesai" | |
| 9.6 | Scan QR | Klik "Scan" → arahkan ke QR pembeli | Pesanan terverifikasi otomatis | |

---

## 10. Pembeli — Status Pesanan

| No | Skenario | Langkah | Hasil Expected | Status |
|---|---|---|---|---|
| 10.1 | Lihat status pesanan | Buka link pesanan dari QR/URL | Status terbaru tampil | |
| 10.2 | Real-time update | Saat panitia klaim, halaman otomatis update | Status berubah tanpa refresh | |
| 10.3 | Download QR masuk | Klik download QR di halaman pesanan | QR masuk bazar terdownload | |
| 10.4 | Chat WhatsApp penjual | Klik tombol WhatsApp | WA terbuka dengan pesan yang sudah terisi | |

---

## 11. Pengaturan Panitia

| No | Skenario | Langkah | Hasil Expected | Status |
|---|---|---|---|---|
| 11.1 | Lihat QRIS | Login panitia → `/panitia/pengaturan` | QRIS kelompok tampil | |
| 11.2 | Upload/ubah QRIS | Upload gambar QRIS baru | QRIS terupdate | |
| 11.3 | Isi nomor WA | Ketik nomor WA | Nomor tersimpan | |
| 11.4 | Cek QRIS muncul di bayar | Buka `/bayar` dari pembeli kelompok ini | QRIS yang benar yang tampil | |

---

## 12. Cross-Browser & Mobile

| No | Skenario | Langkah | Hasil Expected | Status |
|---|---|---|---|---|
| 12.1 | Chrome desktop | Buka semua halaman di Chrome | Semua tampil normal | |
| 12.2 | Chrome mobile | Buka `/pasar` di Chrome Android | Responsive, grid 2 kolom | |
| 12.3 | Safari mobile | Buka `/pasar` di iPhone | Responsive, QR scan berfungsi | |
| 12.4 | QR scan di mobile | Buka `/panitia/scan` di HP | Kamera aktif, scan berhasil | |

---

## Credensial

| Role | Username | Password |
|---|---|---|
| Superadmin | `superadmin` | `bazar123` |
| Panitia 19 | `kelompok19` | `ciruas123` |
| Panitia 20 | `kelompok20` | `ciruas123` |
| Panitia 21 | `kelompok21` | `ciruas123` |
| Panitia 22 | `kelompok22` | `ciruas123` |
| Panitia 23 | `kelompok23` | `ciruas123` |
| Panitia 24 | `kelompok24` | `ciruas123` |
| Panitia 25 | `kelompok25` | `ciruas123` |
