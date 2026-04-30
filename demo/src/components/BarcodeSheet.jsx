import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import sampleData from '../data/sample.json';

const CATEGORY_ICONS = {
  sand: 'bi-beach',
  snack: 'bi-cookie',
  drink: 'bi-cup-straw',
  souvenir: 'bi-gift',
  gift: 'bi-gift-fill',
  ticket: 'bi-ticket-perforated',
  storage: 'bi-box',
  other: 'bi-tag',
};

// Render one QR code into a <canvas> element
function QRCanvas({ value }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    QRCode.toCanvas(ref.current, value, {
      width: 180,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    });
  }, [value]);
  return <canvas ref={ref} style={{ display: 'block', width: 180, height: 180 }} />;
}

// Render one EAN-13 barcode into an <svg> element
function EANSvg({ value }) {
  const ref = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    try {
      JsBarcode(ref.current, value, {
        format: 'EAN13',
        width: 2,
        height: 80,
        displayValue: true,
        fontSize: 13,
        margin: 4,
      });
      setError(false);
    } catch {
      setError(true);
    }
  }, [value]);

  if (error) {
    return (
      <div className="text-muted small text-center" style={{ width: 180, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span>Invalid EAN-13</span>
      </div>
    );
  }

  return <svg ref={ref} style={{ display: 'block', maxWidth: 200 }} />;
}

function CodeCard({ code }) {
  const icon = CATEGORY_ICONS[code.category] ?? 'bi-tag';
  const isQR = code.codeType === 'qr_code';

  return (
    <div className="barcode-card">
      <div className="barcode-card-image">
        {isQR
          ? <QRCanvas value={code.codeValue} />
          : <EANSvg value={code.codeValue} />
        }
      </div>
      <div className="barcode-card-label">
        <i className={`bi ${icon}`}></i>
        {' '}{code.name}
      </div>
      <div className="barcode-card-sub">
        {isQR ? 'QR' : 'EAN-13'} · {code.category}
      </div>
    </div>
  );
}

export default function BarcodeSheet({ show, onClose }) {
  // Close on Escape
  useEffect(() => {
    if (!show) return;
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show, onClose]);

  if (!show) return null;

  const codes = sampleData.codeDefinitions;

  return (
    <>
      {/* Backdrop — hidden when printing */}
      <div
        className="modal-backdrop fade show no-print"
        onClick={onClose}
        style={{ zIndex: 1040 }}
      />

      {/* Modal */}
      <div
        className="modal fade show d-block"
        role="dialog"
        aria-modal="true"
        aria-labelledby="barcodeSheetLabel"
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">

            <div className="modal-header no-print">
              <h5 className="modal-title" id="barcodeSheetLabel">
                <i className="bi bi-upc-scan me-2"></i>Demo Barcodes
              </h5>
              <div className="d-flex gap-2 ms-auto me-3">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => window.print()}
                >
                  <i className="bi bi-printer me-1"></i>Print
                </button>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              />
            </div>

            <div className="modal-body">
              <p className="text-muted small no-print mb-4">
                <i className="bi bi-info-circle me-1"></i>
                These are all the codes defined in the sample dataset. Open this page on a computer, then use your phone to scan them with the{' '}
                <strong>Scan Code</strong> button on the demo home screen.
                Use <strong>Print</strong> to get a physical sheet.
              </p>

              <div className="barcode-grid">
                {codes.map((code) => (
                  <CodeCard key={code.id} code={code} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
