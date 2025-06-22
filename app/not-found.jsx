"use client";

import Link from "next/link";
import Navbar from "../components/ui/Navbar";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <div className="text-center max-w-lg mx-auto">
          {/* 404 Number */}
          <h1 className="text-7xl font-bold text-gray-900 mb-4">404</h1>

          {/* Message */}
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist.
          </p>

          {/* Action */}
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
