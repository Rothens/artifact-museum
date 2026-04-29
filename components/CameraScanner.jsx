"use client";

import { useEffect, useRef } from "react";

const FORMAT_MAP = {
  QR_CODE: "qr_code",
  EAN_13: "ean_13",
  EAN_8: "ean_8",
  UPC_A: "upc_a",
  UPC_E: "upc_e",
  CODE_128: "code_128",
  CODE_39: "code_39",
  CODE_93: "code_93",
  ITF: "itf",
  CODABAR: "codabar",
  DATA_MATRIX: "data_matrix",
  AZTEC: "aztec",
  PDF_417: "pdf_417",
};

function normalizeFormat(rawFormat) {
  const key = String(rawFormat).toUpperCase().replace(/[-\s]/g, "_");
  return FORMAT_MAP[key] ?? "other";
}

function buildCodeKey(codeType, codeValue) {
  return `${codeType}:${codeValue}`;
}

const SCANNER_ID = "museum-qr-scanner";

export default function CameraScanner({ active, onDetected, onStart }) {
  const scannerRef = useRef(null);
  const detectedRef = useRef(false);

  useEffect(() => {
    if (!active) return;

    let html5QrCode;

    async function startScanner() {
      const { Html5Qrcode } = await import("html5-qrcode");
      html5QrCode = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = html5QrCode;
      detectedRef.current = false;

      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          (decodedText, result) => {
            if (detectedRef.current) return;
            detectedRef.current = true;
            const codeType = normalizeFormat(result?.result?.format?.formatName ?? "");
            const codeKey = buildCodeKey(codeType, decodedText);
            onDetected({ codeValue: decodedText, codeType, codeKey });
          },
          () => {} // ignore per-frame errors
        );
        onStart?.();
      } catch (err) {
        console.error("Camera start failed:", err);
      }
    }

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [active, onDetected, onStart]);

  return (
    <div>
      <div
        id={SCANNER_ID}
        className="rounded overflow-hidden border"
        style={{ minHeight: 300 }}
      />
    </div>
  );
}
