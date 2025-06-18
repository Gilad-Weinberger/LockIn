"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  hasSubscriptionLevel,
  SUBSCRIPTION_LEVELS,
} from "@/lib/utils/subscription-utils";

const SettingsSidebar = ({ activeSection, onSectionChange }) => {
  const { user } = useAuth();
  const [isProfessionalUser, setIsProfessionalUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const hasProfessional = await hasSubscriptionLevel(
          user.uid,
          SUBSCRIPTION_LEVELS.PRO
        );
        setIsProfessionalUser(hasProfessional);
      } catch (error) {
        console.error("Error checking subscription level:", error);
        setIsProfessionalUser(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [user?.uid]);

  const getAllSettingsItems = () => [
    {
      id: "profile",
      label: "Profile",
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      requiresPro: false,
    },
    {
      id: "billing",
      label: "Billing",
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
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
      requiresPro: false,
    },
    {
      id: "ai-settings",
      label: "AI Settings",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          {/* Main diamond/star shape */}
          <path d="M12 2l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" />
          {/* Small sparkles */}
          <path d="M6 6l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
          <path d="M18 4l0.5 1 1 0.5-1 0.5-0.5 1-0.5-1-1-0.5 1-0.5z" />
          <path d="M20 16l0.8 1.6 1.6 0.8-1.6 0.8-0.8 1.6-0.8-1.6-1.6-0.8 1.6-0.8z" />
        </svg>
      ),
      requiresPro: false,
    },
    {
      id: "prioritizing-rules",
      label: "Prioritizing Rules",
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
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
      requiresPro: true,
    },
    {
      id: "scheduling-rules",
      label: "Scheduling Rules",
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      requiresPro: true,
    },
    {
      id: "google-calendar",
      label: "Calendar",
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6"
          />
        </svg>
      ),
      requiresPro: true,
    },
  ];

  // Show all settings items, but disable pro features for non-pro users
  const getVisibleSettingsItems = () => {
    return getAllSettingsItems(); // Always show all items
  };

  const settingsItems = getVisibleSettingsItems();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {settingsItems.map((item) => (
          <button
            key={item.id}
            onClick={() =>
              item.requiresPro && !isProfessionalUser
                ? null
                : onSectionChange(item.id)
            }
            disabled={item.requiresPro && !isProfessionalUser}
            className={`
              w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 relative
              ${
                activeSection === item.id
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : item.requiresPro && !isProfessionalUser
                  ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }
            `}
          >
            <span
              className={`mr-3 ${
                activeSection === item.id
                  ? "text-blue-700"
                  : item.requiresPro && !isProfessionalUser
                  ? "text-gray-300"
                  : "text-gray-400"
              }`}
            >
              {item.icon}
            </span>
            {item.label}
            {item.requiresPro && !isProfessionalUser && (
              <span className="ml-auto text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full">
                PRO
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SettingsSidebar;
