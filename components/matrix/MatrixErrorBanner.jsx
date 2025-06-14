"use client";

const MatrixErrorBanner = ({ error, onRetry }) => {
  if (!error) return null;

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {error}
      <button onClick={onRetry} className="ml-4 text-sm underline">
        Retry
      </button>
    </div>
  );
};

export default MatrixErrorBanner;
