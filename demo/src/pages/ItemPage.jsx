import { Link, useParams } from 'react-router-dom';
import { getItemById } from '../data/db.js';

export default function ItemPage() {
  const { id } = useParams();
  const item = getItemById(id);

  if (!item) {
    return (
      <main className="container py-5 text-center">
        <i className="bi bi-question-circle fs-1 text-muted mb-3 d-block"></i>
        <h2>Item not found</h2>
        <Link to="/browse" className="btn btn-outline-secondary mt-3">Back to collection</Link>
      </main>
    );
  }

  const name = item.label || item.code_name || 'Unnamed item';

  return (
    <main className="container py-4" style={{ maxWidth: 680 }}>
      <div className="d-flex align-items-center mb-4 gap-3">
        <Link to="/browse" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <span className="badge bg-secondary text-capitalize">{item.category}</span>
      </div>

      {item.photo_data_url && (
        <img
          src={item.photo_data_url}
          alt={name}
          className="rounded mb-4 w-100"
          style={{ maxHeight: 420, objectFit: 'cover' }}
        />
      )}

      <h1 className="h3 fw-bold mb-1">{name}</h1>

      {item.collected_at && (
        <p className="text-muted small mb-3">
          Collected{' '}
          {new Date(item.collected_at).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      )}

      {item.notes && <p className="mb-4">{item.notes}</p>}

      {(item.meta_price || item.meta_source_shop || item.meta_recipient ||
        item.meta_consumed !== null || item.meta_gifted !== null) && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h6 className="card-title text-muted mb-3">Details</h6>
            <dl className="row mb-0 small">
              {item.meta_price && (
                <>
                  <dt className="col-5">Price</dt>
                  <dd className="col-7">{item.meta_price} {item.meta_currency}</dd>
                </>
              )}
              {item.meta_source_shop && (
                <>
                  <dt className="col-5">Shop</dt>
                  <dd className="col-7">{item.meta_source_shop}</dd>
                </>
              )}
              {item.meta_recipient && (
                <>
                  <dt className="col-5">Recipient</dt>
                  <dd className="col-7">{item.meta_recipient}</dd>
                </>
              )}
              {item.meta_consumed !== null && (
                <>
                  <dt className="col-5">Consumed</dt>
                  <dd className="col-7">{item.meta_consumed ? 'Yes' : 'No'}</dd>
                </>
              )}
              {item.meta_gifted !== null && (
                <>
                  <dt className="col-5">Gifted</dt>
                  <dd className="col-7">{item.meta_gifted ? 'Yes' : 'No'}</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      )}

      {item.location_lat && (
        <a
          href={`https://www.google.com/maps?q=${item.location_lat},${item.location_lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-secondary btn-sm"
        >
          <i className="bi bi-geo-alt me-1"></i>View on map
        </a>
      )}
    </main>
  );
}
