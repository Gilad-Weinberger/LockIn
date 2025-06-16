import Link from "next/link";
import { navigationLinks } from "@/lib/homepage-data";

const NavigationLinks = ({ isLoggedIn, className = "" }) => {
  const getNavigationLinks = () => {
    if (isLoggedIn) {
      return [
        { href: "/tasks", label: "Tasks" },
        { href: "/matrix", label: "Matrix" },
        { href: "/calendar", label: "Calendar" },
      ];
    } else {
      return navigationLinks; // Use the default homepage links
    }
  };

  // Check if this is mobile layout based on className
  const isMobileLayout = className.includes("space-y-1");

  return (
    <div className={className}>
      {getNavigationLinks().map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={
            isMobileLayout
              ? "block px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors"
              : "text-gray-600 hover:text-blue-600 transition-colors"
          }
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
};

export default NavigationLinks;
