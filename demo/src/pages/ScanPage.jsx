import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { lookupByCodeKey } from '../data/db.js';
import CameraScanner from '../components/CameraScanner.jsx';

const FORMAT_MAP = {
  QR_CODE: 'qr_code', EAN_13: 'ean_13', EAN_8: 'ean_8',
  UPC_A: 'upc_a', UPC_E: 'upc_e', CODE_128: 'code_128',
  CODE_39: 'code_39', CODE_93: 'code_93', ITF: 'itf',
  CODABAR: 'codabar', DATA_MATRIX: 'data_matrix',
  AZTEC: 'aztec', PDF_417: 'pdf_417',
};

function normalizeFormat(rawFormat) {
  const key = String(rawFormat).toUpperCase().replace(/[-\s]/g, '_');
  return FORMAT_MAP[key] ?? 'other';
}

export default function ScanPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); // idle | scanning | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleDetected = useCallback(({ codeType, codeValue }) => {
    const codeKey = `${codeType}:${codeValue}`;
    const itemId = lookupByCodeKey(codeKey);
    if (itemId) {
      navigate(`/item/${itemId}`);
    } else {
      setErrorMsg(`Code not recognised in this demo collection.\n(${codeKey})`);
      setStatus('error');
    }
  }, [navigate]);

  return (
    <main className="container py-4" style={{ maxWidth: 520 }}>
      <div className="d-flex align-items-center mb-4 gap-3">
        <Link to="/" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <h1 className="h4 mb-0">Scan Code</h1>
      </div>

      <div className="alert alert-info py-2 mb-3 small">
        <i className="bi bi-info-circle me-1"></i>
        This demo recognises QR codes and barcodes from the sample dataset.
        Try scanning a QR code you printed yourself, or use "Browse All" to explore items directly.
      </div>

      {status === 'error' && (
        <div className="alert alert-warning d-flex align-items-start gap-2 mb-3">
          <i className="bi bi-exclamation-triangle-fill mt-1 flex-shrink-0"></i>
          <span style={{ whiteSpace: 'pre-line' }}>{errorMsg}</span>
          <button
            className="btn btn-sm btn-outline-secondary ms-auto flex-shrink-0"
            onClick={() => setStatus('idle')}
          >
            ↩
          </button>
        </div>
      )}

      <CameraScanner
        active={status === 'idle' || status === 'scanning'}
        onDetected={handleDetected}
        onStart={() => setStatus('scanning')}
        normalizeFormat={normalizeFormat}
      />
    </main>
  );
}
