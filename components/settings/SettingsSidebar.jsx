"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  hasSubscriptionLevel,
  SUBSCRIPTION_LEVELS,
} from "@/lib/utils/subscription-utils";

const SettingsSidebar = () => {
  const pathname = usePathname();
  const activeSection = pathname.split("/")[2] || "profile";

  const { user } = useAuth();
  const [isProfessionalUser, setIsProfessionalUser] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user?.uid) {
        setIsProfessionalUser(false);
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
      }
    };

    checkSubscription();
  }, [user?.uid]);

  const settingsItems = [
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
          <path d="M12 2L15 8L21 11L15 14L12 20L9 14L3 11L9 8Z" />
          {/* Small sparkles */}
          <path d="M6 6L7 8L9 7L7 8L6 10L5 8L3 7L5 8Z" />
          <path d="M18 4L18.5 5L19.5 4.5L18.5 5L18 6L17.5 5L16.5 4.5L17.5 5Z" />
          <path d="M20 16L20.8 17.6L22.4 16.8L20.8 17.6L20 19.2L19.2 17.6L17.6 16.8L19.2 17.6Z" />
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
      label: "Google Calendar",
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
        {settingsItems.map((item) => {
          const isActive = activeSection === item.id;
          const isDisabled = item.requiresPro && !isProfessionalUser;

          const commonClasses =
            "w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 relative";

          if (isDisabled) {
            return (
              <Link
                key={item.id}
                href="/settings/billing"
                className={`${commonClasses} text-gray-600 hover:text-gray-900 hover:bg-gray-50`}
              >
                <span className="mr-3 text-gray-400">{item.icon}</span>
                {item.label}
                <span className="ml-auto text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full">
                  PRO
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.id}
              href={`/settings/${item.id}`}
              className={`${commonClasses} ${
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span
                className={`mr-3 ${
                  isActive ? "text-blue-700" : "text-gray-400"
                }`}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default SettingsSidebar;
