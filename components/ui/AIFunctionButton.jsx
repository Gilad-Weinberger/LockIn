"use client";

const AIFunctionButton = ({
  onClick,
  disabled = false,
  isProcessing = false,
  processingText = "Processing...",
  children,
  className = "",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const SparklesIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      {/* Main diamond/star shape */}
      <path d="M12 2l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" />
      {/* Small sparkles */}
      <path d="M6 6l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
      <path d="M18 4l0.5 1 1 0.5-1 0.5-0.5 1-0.5-1-1-0.5 1-0.5z" />
      <path d="M20 16l0.8 1.6 1.6 0.8-1.6 0.8-0.8 1.6-0.8-1.6-1.6-0.8 1.6-0.8z" />
    </svg>
  );

  const LoadingIcon = ({ className }) => (
    <svg
      className={`animate-spin ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      onClick={onClick}
      disabled={disabled || isProcessing}
      className={`${sizeClasses[size]} bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 ${className}`}
    >
      {isProcessing ? (
        <>
          <LoadingIcon className={iconSizeClasses[size]} />
          {processingText}
        </>
      ) : (
        <>
          <SparklesIcon className={iconSizeClasses[size]} />
          {children}
        </>
      )}
    </button>
  );
};

export default AIFunctionButton;
