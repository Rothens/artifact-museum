"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CameraScanner from "../../components/CameraScanner.jsx";

export default function ScanClient({ strings }) {
  const router = useRouter();
  const [status, setStatus] = useState("idle"); // idle | scanning | loading | error
  const [errorMsg, setErrorMsg] = useState("");

  async function handleDetected({ codeKey }) {
    if (status === "loading") return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/lookup?codeKey=${encodeURIComponent(codeKey)}`);
      if (res.ok) {
        const { itemId } = await res.json();
        router.push(`/item/${itemId}?ref=scan`);
      } else if (res.status === 404) {
        setErrorMsg(strings.notFound);
        setStatus("error");
      } else {
        setErrorMsg("Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Are you connected?");
      setStatus("error");
    }
  }

  return (
    <main className="container py-4" style={{ maxWidth: 520 }}>
      <div className="d-flex align-items-center mb-4 gap-3">
        <Link href="/" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <h1 className="h4 mb-0">{strings.title}</h1>
      </div>

      {status === "error" && (
        <div className="alert alert-warning d-flex align-items-center gap-2 mb-3">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{errorMsg}</span>
          <button
            className="btn btn-sm btn-outline-secondary ms-auto"
            onClick={() => setStatus("idle")}
          >
            ↩
          </button>
        </div>
      )}

      {status === "loading" && (
        <div className="alert alert-info d-flex align-items-center gap-2 mb-3">
          <span className="spinner-border spinner-border-sm"></span>
          <span>{strings.scanning}</span>
        </div>
      )}

      <CameraScanner
        active={status === "idle" || status === "scanning"}
        onDetected={handleDetected}
        onStart={() => setStatus("scanning")}
      />
    </main>
  );
}
