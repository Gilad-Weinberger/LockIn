import Link from "next/link";

const GetStartedButton = ({ 
  href = "/auth/signup", 
  text = "Get Started", 
  className = "",
  size = "lg" 
}) => {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <Link
      href={href}
      className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white ${sizeClasses[size]} rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 ${className}`}
    >
      <span>{text}</span>
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7l5 5m0 0l-5 5m5-5H6"
        />
      </svg>
    </Link>
  );
};

export default GetStartedButton; 