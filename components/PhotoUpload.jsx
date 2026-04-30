"use client";

import { useState } from "react";

export default function PhotoUpload({ currentDataUrl, currentPhotoName, labels }) {
  const [preview, setPreview] = useState(currentDataUrl || null);
  const [photoData, setPhotoData] = useState({ url: "", name: "", width: "", height: "", size: "" });
  const [pending, setPending] = useState(false);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPending(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const img = new Image();
      img.onload = () => {
        setPhotoData({ url: dataUrl, name: file.name, width: img.naturalWidth, height: img.naturalHeight, size: file.size });
        setPreview(dataUrl);
        setPending(false);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function handleClear() {
    setPhotoData({ url: "__clear__", name: "", width: "", height: "", size: "" });
    setPreview(null);
  }

  // Show a filename hint when no photo data is loaded yet but we know the original filename
  const showNameHint = !preview && !photoData.url && currentPhotoName;

  return (
    <div>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Preview"
          className="img-fluid rounded mb-2"
          style={{ maxHeight: 200, objectFit: "cover" }}
        />
      ) : showNameHint ? (
        <div
          className="rounded border bg-light d-flex align-items-center gap-3 px-3 mb-2"
          style={{ height: 80 }}
        >
          <i className="bi bi-image text-muted fs-2"></i>
          <div>
            <div className="fw-semibold small">{currentPhotoName}</div>
            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
              Photo not included in export — upload the file above to restore it
            </div>
          </div>
        </div>
      ) : (
        <div
          className="rounded bg-light d-flex align-items-center justify-content-center text-muted mb-2"
          style={{ height: 120 }}
        >
          <i className="bi bi-image fs-1"></i>
        </div>
      )}

      <input type="file" accept="image/*" className="form-control form-control-sm mb-2" onChange={handleFile} disabled={pending} />
      {pending && <div className="text-muted small mb-2">Processing…</div>}
      {(preview || showNameHint) && (
        <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleClear}>
          <i className="bi bi-trash me-1"></i>{labels.clear}
        </button>
      )}

      <input type="hidden" name="photo_data_url" value={photoData.url} onChange={() => {}} />
      <input type="hidden" name="photo_name" value={photoData.name} onChange={() => {}} />
      <input type="hidden" name="photo_width" value={photoData.width} onChange={() => {}} />
      <input type="hidden" name="photo_height" value={photoData.height} onChange={() => {}} />
      <input type="hidden" name="photo_size" value={photoData.size} onChange={() => {}} />
    </div>
  );
}
