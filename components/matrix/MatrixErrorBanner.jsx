"use client";

const MatrixErrorBanner = ({ error, onRetry }) => {
  if (!error) return null;

  // Check if this is a success message (starts with checkmark)
  const isSuccess = error.startsWith("✅");

  const baseClasses = "px-4 py-3 rounded mb-4";
  const successClasses = "bg-green-100 border border-green-400 text-green-700";
  const errorClasses = "bg-red-100 border border-red-400 text-red-700";

  return (
    <div
      className={`${baseClasses} ${isSuccess ? successClasses : errorClasses}`}
    >
      {error}
      {!isSuccess && (
        <button onClick={onRetry} className="ml-4 text-sm underline">
          Retry
        </button>
      )}
    </div>
  );
};

export default MatrixErrorBanner;
