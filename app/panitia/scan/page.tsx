"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Html5Qrcode from "html5-qrcode";

export default function ScanPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  async function startScanner() {
    try {
      const scanner = new Html5Qrcode("reader");
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      await scanner.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          setScannedData(decodedText);
          scanner.stop().then(() => {
            setScanning(false);
            const tokenMatch = decodedText.match(/verify\/([a-zA-Z0-9]+)/);
            if (tokenMatch) {
              router.push(`/verify/${tokenMatch[1]}`);
            } else {
              router.push(`/verify/${decodedText}`);
            }
          });
        },
        () => {}
      );
      scannerRef.current = scanner;
      setScanning(true);
    } catch (err: any) {
      setError("Gagal mengaktifkan kamera: " + err.message);
    }
  }

  async function stopScanner() {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanning(false);
  }

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="min-h-screen bg-paddy flex flex-col items-center px-5">
      <h1 className="font-display font-bold text-2xl text-cream mt-6 mb-2">Scan Barcode</h1>
      <p className="text-sm text-cream/70 mb-2">Arahkan kamera ke barcode pembeli</p>

      <div className="bg-cream/10 border border-cream/20 rounded-lg p-3 mb-4 max-w-sm w-full">
        <p className="text-xs text-cream/80 leading-relaxed">
          <strong className="text-cream">Cara pakai:</strong> Minta pembeli tunjukkan barcode dari halaman &quot;Status Pesanan&quot;. Arahkan kamera ke barcode, lalu proses verifikasi atau pengambilan.
        </p>
      </div>

      <div id="reader" className="w-full max-w-sm rounded-xl overflow-hidden mb-4" />

      {!scanning && !scannedData && !error && (
        <button
          onClick={startScanner}
          className="bg-cream text-paddy rounded-lg py-3 px-8 font-medium"
        >
          Mulai Scan
        </button>
      )}

      {error && (
        <div className="bg-white rounded-xl p-4 max-w-sm w-full text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={startScanner}
            className="mt-3 bg-cream text-paddy rounded-lg py-2 px-6 font-medium text-sm"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {scannedData && (
        <div className="bg-white rounded-xl p-4 max-w-sm w-full text-center">
          <p className="text-sm text-paddy font-medium mb-2">✓ Barcode terdeteksi!</p>
          <p className="text-xs text-kerbau break-all">{scannedData}</p>
          <button
            onClick={() => {
              const tokenMatch = scannedData.match(/verify\/([a-zA-Z0-9]+)/);
              if (tokenMatch) {
                router.push(`/verify/${tokenMatch[1]}`);
              }
            }}
            className="mt-3 bg-paddy text-cream rounded-lg py-2 px-6 font-medium text-sm"
          >
            Lanjut ke verifikasi
          </button>
          <br />
          <button
            onClick={startScanner}
            className="mt-2 text-sm text-cream underline"
          >
            Scan lagi
          </button>
        </div>
      )}

      <button
        onClick={stopScanner}
        className="mt-4 text-sm text-cream/70 underline mb-6"
      >
        Matikan Kamera
      </button>
    </div>
  );
}
