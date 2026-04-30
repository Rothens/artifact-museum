import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import ItemPage from './pages/ItemPage.jsx';
import ScanPage from './pages/ScanPage.jsx';

// HashRouter keeps the demo working on GH Pages without server-side routing
export default function App() {
  return (
    <HashRouter>
      {/* Language switcher placeholder — fixed bottom-right like the real museum */}
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 1000 }}>
        <span className="badge bg-secondary">Demo</span>
      </div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/item/:id" element={<ItemPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}

function NotFound() {
  return (
    <main className="container py-5 text-center">
      <i className="bi bi-question-circle fs-1 text-muted mb-3 d-block"></i>
      <h2>Page not found</h2>
      <a href="#/" className="btn btn-outline-secondary mt-3">Back to home</a>
    </main>
  );
}
