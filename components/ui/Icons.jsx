const EditIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <path
      d="M17.414 2.586a2 2 0 0 0-2.828 0l-9.5 9.5A2 2 0 0 0 4 13.914V16a1 1 0 0 0 1 1h2.086a2 2 0 0 0 1.414-.586l9.5-9.5a2 2 0 0 0 0-2.828l-1.586-1.586zM6.5 15H5v-1.5l8.793-8.793 1.5 1.5L6.5 15zm9.207-9.207l-1.5-1.5 1.207-1.207a1 1 0 0 1 1.414 1.414l-1.121 1.293z"
      fill="currentColor"
    />
    <line
      x1="4"
      y1="21"
      x2="20"
      y2="21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const DeleteIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const CheckIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ActionButton = ({
  onClick,
  ariaLabel,
  variant = "default",
  className = "",
  children,
}) => {
  const variantClasses = {
    edit: "hover:bg-blue-100",
    delete: "hover:bg-red-100",
    check: "hover:bg-green-100",
    default: "hover:bg-gray-100",
  };

  return (
    <button
      type="button"
      className={`p-1 rounded ${variantClasses[variant]} ${className}`}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Import and re-export NavigationButton
export { default as NavigationButton } from "./NavigationButton";
export { EditIcon, DeleteIcon, CheckIcon, ActionButton };
