import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900">
      <h1 className="text-6xl font-black text-rose-500 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-slate-600 mb-8 max-w-md text-center">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-rose-700 transition"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
