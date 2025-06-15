"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOutUser } from "@/lib/auth";
import MenuButton from "./MenuButton";

const DropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef(null);

  // Check if we're on the settings page
  const isOnSettingsPage = pathname === "/settings";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setIsOpen(false);

    try {
      const { error } = await signOutUser();
      if (error) {
        console.error("Logout error:", error);
        setIsLoggingOut(false);
        return;
      }

      // Redirect to signin page after successful logout
      router.push("/auth/signin");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const handleNavigation = () => {
    setIsOpen(false);
    if (isOnSettingsPage) {
      router.push("/tasks");
    } else {
      router.push("/settings");
    }
  };

  // Icons
  const settingsIcon = (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );

  const tasksIcon = (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const logoutIcon = (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  );

  return (
    <div className="relative z-10" ref={dropdownRef}>
      {/* Horizontal dropdown menu - positioned to the right */}
      {isOpen && (
        <div className="absolute -bottom-0.5 left-12 bg-white rounded-md shadow-lg border border-gray-200 py-1.5 px-1.5 animate-in fade-in slide-in-from-left-2 duration-200">
          <div className="flex items-center gap-1">
            <MenuButton
              onClick={handleNavigation}
              icon={isOnSettingsPage ? tasksIcon : settingsIcon}
            >
              {isOnSettingsPage ? "Tasks" : "Settings"}
            </MenuButton>

            <div className="border-l border-gray-200 h-6"></div>

            <MenuButton
              onClick={handleLogout}
              icon={logoutIcon}
              variant="danger"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </MenuButton>
          </div>
        </div>
      )}

      {/* Three dots button - smaller */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 outline-none ring-2 ring-blue-500"
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
    </div>
  );
};

export default DropdownMenu;
