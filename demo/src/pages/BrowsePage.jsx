import { Link } from 'react-router-dom';
import { allItems } from '../data/db.js';

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

export default function BrowsePage() {
  return (
    <main className="container py-4">
      <div className="d-flex align-items-center mb-4 gap-3">
        <Link to="/" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <h1 className="h4 mb-0">
          Collection{' '}
          <span className="badge bg-secondary fw-normal">{allItems.length}</span>
        </h1>
      </div>

      <div className="row g-3">
        {allItems.map((item) => {
          const icon = CATEGORY_ICONS[item.category] ?? 'bi-tag';
          const name = item.label || item.code_name || 'Unnamed item';
          return (
            <div key={item.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <Link
                to={`/item/${item.id}`}
                className="card text-decoration-none h-100 shadow-sm hover-card"
              >
                <div
                  className="card-img-top d-flex align-items-center justify-content-center bg-light text-muted"
                  style={{ height: 160 }}
                >
                  <i className={`bi ${icon} fs-1`}></i>
                </div>
                <div className="card-body">
                  <p className="card-title mb-1 fw-semibold">{name}</p>
                  <span className="badge bg-light text-secondary text-capitalize border">
                    {item.category}
                  </span>
                  {item.photo_name && (
                    <span className="badge bg-light text-secondary border ms-1">
                      <i className="bi bi-image me-1"></i>photo
                    </span>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}
