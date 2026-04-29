"use client";

import { useState, useRef } from "react";

export default function UploadForm({ onImport }) {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const imported = await onImport(payload);
      setResult(imported);
      setStatus("success");
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setErrorMsg(err?.message || "Failed to import. Make sure the file is a valid Artifact Logger export.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card shadow-sm p-4" style={{ maxWidth: 480 }}>
      <div className="mb-3">
        <label className="form-label fw-semibold">Artifact Logger export (.json)</label>
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="form-control"
          required
          onChange={() => setStatus("idle")}
        />
      </div>

      {status === "success" && result && (
        <div className="alert alert-success py-2 small mb-3">
          <i className="bi bi-check-circle me-2"></i>
          Imported {result.codes} code definitions and {result.items} item records.
        </div>
      )}

      {status === "error" && (
        <div className="alert alert-danger py-2 small mb-3">
          <i className="bi bi-exclamation-circle me-2"></i>
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={status === "loading"}
      >
        {status === "loading" ? (
          <><span className="spinner-border spinner-border-sm me-2"></span>Importing…</>
        ) : (
          <><i className="bi bi-upload me-2"></i>Import</>
        )}
      </button>
    </form>
  );
}
