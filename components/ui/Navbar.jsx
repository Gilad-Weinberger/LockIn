"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import NavbarLogo from "./navbar/NavbarLogo";
import NavigationLinks from "./navbar/NavigationLinks";
import UserDropdownMenu from "./UserDropdownMenu";
import MobileMenu from "./navbar/MobileMenu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, userData, logout } = useAuth();

  const isLoggedIn = user && user.uid;

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <NavbarLogo />

          {/* Desktop Navigation */}
          <NavigationLinks
            isLoggedIn={isLoggedIn}
            className="hidden md:flex items-center space-x-9"
          />

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <UserDropdownMenu
                user={user}
                userData={userData}
                onLogout={logout}
              />
            ) : (
              <Link
                href="/auth/signup"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileMenu
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          isLoggedIn={isLoggedIn}
          user={user}
          userData={userData}
          onLogout={logout}
        />
      </div>
    </nav>
  );
};

export default Navbar;
