"use client";

import { useEffect, useRef } from 'react';

const SCANNER_ID = 'demo-qr-scanner';

export default function CameraScanner({ active, onDetected, onStart, normalizeFormat }) {
  const scannerRef = useRef(null);
  const detectedRef = useRef(false);

  useEffect(() => {
    if (!active) return;

    let html5QrCode;

    async function startScanner() {
      const { Html5Qrcode } = await import('html5-qrcode');
      html5QrCode = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = html5QrCode;
      detectedRef.current = false;

      try {
        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          (decodedText, result) => {
            if (detectedRef.current) return;
            detectedRef.current = true;
            const rawFormat = result?.result?.format?.formatName ?? '';
            const codeType = normalizeFormat(rawFormat);
            onDetected({ codeValue: decodedText, codeType });
          },
          () => {}
        );
        onStart?.();
      } catch (err) {
        console.error('Camera start failed:', err);
      }
    }

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [active, onDetected, onStart, normalizeFormat]);

  return (
    <div
      id={SCANNER_ID}
      className="rounded overflow-hidden border"
      style={{ minHeight: 300 }}
    />
  );
}
