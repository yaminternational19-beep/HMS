import React from 'react';
import { Link } from 'react-router-dom';

/**
 * NoRoute — 404 fallback page for unmatched routes.
 */
const NoRoute = () => {
  return (
    <div className="flex-center min-h-screen flex-col gap-4 bg-bg-main">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="text-xl text-text-muted">Page not found.</p>
      <Link
        to="/"
        className="mt-4 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NoRoute;
