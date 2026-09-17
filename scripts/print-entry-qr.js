/**
 * Generate satu QR code (cukup satu untuk seluruh bazar, ditempel di gerbang
 * masuk/spanduk) yang mengarah ke halaman pasar digital.
 * Pakai: node scripts/print-entry-qr.js
 */
const QRCode = require("qrcode");

const baseUrl = process.env.APP_URL || "https://bazar.contohkkn.my.id";
const url = `${baseUrl}/pasar`;

QRCode.toFile("qr-masuk-bazar.png", url, { width: 600 }, (err) => {
  if (err) throw err;
  console.log(`QR disimpan sebagai qr-masuk-bazar.png`);
  console.log(`URL: ${url}`);
});
