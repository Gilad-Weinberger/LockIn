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
      <path d="M12 2L15 8L21 11L15 14L12 20L9 14L3 11L9 8Z" />
      {/* Small sparkles */}
      <path d="M6 6L7 8L9 7L7 8L6 10L5 8L3 7L5 8Z" />
      <path d="M18 4L18.5 5L19.5 4.5L18.5 5L18 6L17.5 5L16.5 4.5L17.5 5Z" />
      <path d="M20 16L20.8 17.6L22.4 16.8L20.8 17.6L20 19.2L19.2 17.6L17.6 16.8L19.2 17.6Z" />
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
