import { useState } from 'react';
import { Link } from 'react-router-dom';
import BarcodeSheet from '../components/BarcodeSheet.jsx';

export default function HomePage() {
  const [showBarcodes, setShowBarcodes] = useState(false);

  return (
    <main className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold mb-2">Artifact Museum</h1>
        <p className="text-muted">Scan a code or browse the collection</p>
        <div className="mt-3 d-flex flex-wrap gap-2 justify-content-center">
          <span className="badge bg-warning text-dark">
            <i className="bi bi-eye me-1"></i>Demo — sample Japan trip data
          </span>
          <a
            href="https://github.com/Rothens/artifact-museum"
            target="_blank"
            rel="noopener noreferrer"
            className="badge bg-dark text-decoration-none"
          >
            <i className="bi bi-github me-1"></i>GitHub
          </a>
        </div>
      </div>

      <div className="row g-3 justify-content-center">
        <div className="col-12 col-sm-6 col-md-4">
          <Link to="/scan" className="card card-body text-center text-decoration-none h-100 p-4 shadow-sm hover-card">
            <i className="bi bi-qr-code-scan fs-1 mb-3 text-primary"></i>
            <h5 className="mb-1">Scan Code</h5>
            <p className="text-muted small mb-0">Point your camera at a QR or barcode</p>
          </Link>
        </div>

        <div className="col-12 col-sm-6 col-md-4">
          <Link to="/browse" className="card card-body text-center text-decoration-none h-100 p-4 shadow-sm hover-card">
            <i className="bi bi-grid fs-1 mb-3 text-primary"></i>
            <h5 className="mb-1">Browse All</h5>
            <p className="text-muted small mb-0">Explore the entire collection</p>
          </Link>
        </div>

        <div className="col-12 col-sm-6 col-md-4">
          <button
            className="card card-body text-center text-decoration-none h-100 p-4 shadow-sm hover-card w-100 border"
            style={{ cursor: 'pointer', background: 'none' }}
            onClick={() => setShowBarcodes(true)}
          >
            <i className="bi bi-upc-scan fs-1 mb-3 text-secondary"></i>
            <h5 className="mb-1">Show Barcodes</h5>
            <p className="text-muted small mb-0">Print or display all demo codes to scan</p>
          </button>
        </div>
      </div>

      <div className="mt-5 pt-3 border-top text-center text-muted small">
        <p className="mb-1">
          This is a read-only demo of{' '}
          <a href="https://github.com/Rothens/artifact-museum" target="_blank" rel="noopener noreferrer">
            Artifact Museum
          </a>
          {' '}— a self-hosted companion to{' '}
          <a href="https://rothens.github.io/artifact-logger/" target="_blank" rel="noopener noreferrer">
            Artifact Logger
          </a>.
        </p>
        <p className="mb-0">
          The data shown is sample content. No server, no database — everything runs in your browser.
        </p>
      </div>

      <BarcodeSheet show={showBarcodes} onClose={() => setShowBarcodes(false)} />
    </main>
  );
}
