"use client";

const AuthRequiredMessage = ({
  title = "Login Required",
  message = "Please log in to access this feature.",
  showSignInButton = true,
  className = "",
  variant = "default", // "default", "compact", "large"
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "compact":
        return {
          container: "text-center py-6",
          icon: "w-12 h-12",
          iconContainer: "w-12 h-12 bg-blue-100 rounded-full mb-3",
          title: "text-base font-medium text-gray-900 mb-2",
          message: "text-sm text-gray-500",
          button:
            "mt-3 inline-flex items-center px-3 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200",
        };
      case "large":
        return {
          container: "text-center py-16",
          icon: "w-10 h-10",
          iconContainer: "w-20 h-20 bg-blue-100 rounded-full mb-6",
          title: "text-2xl font-semibold text-gray-900 mb-4",
          message: "text-lg text-gray-500",
          button:
            "mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200",
        };
      default:
        return {
          container: "text-center py-12",
          icon: "w-8 h-8",
          iconContainer: "w-16 h-16 bg-blue-100 rounded-full mb-4",
          title: "text-lg font-medium text-gray-900 mb-2",
          message: "text-gray-500",
          button:
            "mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200",
        };
    }
  };

  const styles = getVariantClasses();

  return (
    <div className={`${styles.container} ${className}`}>
      <div
        className={`inline-flex items-center justify-center ${styles.iconContainer}`}
      >
        <svg
          className={`${styles.icon} text-blue-600`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {showSignInButton && (
        <a href="/auth/signin" className={styles.button}>
          Sign In
        </a>
      )}
    </div>
  );
};

export default AuthRequiredMessage;
