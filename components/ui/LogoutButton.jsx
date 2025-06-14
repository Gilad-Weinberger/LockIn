"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOutUser } from "@/lib/auth";

const LogoutButton = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

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

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="fixed bottom-8 left-8 z-50 px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Logout"
    >
      {isLoggingOut ? "Logging out..." : "Logout"}
    </button>
  );
};

export default LogoutButton;
