"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const LegalSidebar = ({ activeSection, onSectionChange }) => {
  const router = useRouter();
  const pathname = usePathname();

  const legalItems = [
    {
      id: "tos",
      label: "Terms of Service",
      href: "/legal/tos",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: "privacy-policy",
      label: "Privacy Policy",
      href: "/legal/privacy-policy",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
  ];

  // Determine active section based on pathname if not provided
  const currentActiveSection =
    activeSection ||
    (pathname === "/legal/tos"
      ? "tos"
      : pathname === "/legal/privacy-policy"
      ? "privacy-policy"
      : "");

  const handleSectionChange = (sectionId) => {
    const item = legalItems.find((item) => item.id === sectionId);
    if (item) {
      if (onSectionChange) {
        onSectionChange(sectionId);
      } else {
        router.push(item.href);
      }
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Legal</h1>
        <p className="text-sm text-gray-600 mt-1">
          Legal documents and policies
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {legalItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSectionChange(item.id)}
            className={`
              w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 relative
              ${
                currentActiveSection === item.id
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }
            `}
          >
            <span
              className={`mr-3 ${
                currentActiveSection === item.id
                  ? "text-blue-700"
                  : "text-gray-400"
              }`}
            >
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default LegalSidebar;
