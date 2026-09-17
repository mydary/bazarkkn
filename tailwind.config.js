/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paddy: "#2F4B26",      // hijau daun padi -- warna utama/header
        "paddy-deep": "#20321A",
        gabah: "#C9962B",      // emas gabah/padi matang -- aksen CTA & harga
        indigo: "#2B3A67",     // biru tarum/batik -- aksen sekunder, tautan
        kerbau: "#6B4F3B",     // cokelat tanah/kerbau -- teks muted, border
        anyaman: "#F1EFE4",    // krem anyaman bambu -- latar terang
        "anyaman-soft": "#E7E2D2",
        ink: "#26231C",        // teks utama di atas latar terang
        cream: "#F7F3E7",      // teks di atas latar gelap
      },
      fontFamily: {
        display: ["var(--font-bitter)", "serif"],
        sans: ["var(--font-jakarta)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
