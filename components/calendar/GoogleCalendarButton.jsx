"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { canAccessFeature } from "@/lib/utils/subscription-utils";
import ProPaywall from "@/components/settings/ProPaywall";
import { useRouter } from "next/navigation";

const GoogleCalendarButton = () => {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [canUseFeature, setCanUseFeature] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkFeatureAccess = async () => {
      if (user?.uid) {
        const hasAccess = await canAccessFeature(user.uid, "google_calendar");
        setCanUseFeature(hasAccess); // Use actual feature access check

        // Check if already connected
        try {
          const response = await fetch(
            `/api/calendar/google/settings?userId=${user.uid}`
          );
          if (response.ok) {
            const data = await response.json();
            setIsConnected(data.connected);
          }
        } catch (error) {
          console.error("Error checking Google Calendar connection:", error);
        }
      }
    };

    checkFeatureAccess();
  }, [user]);

  useEffect(() => {
    // Handle connection completion from OAuth flow
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("google_calendar_success") === "true") {
      if (user?.uid) {
        handleConnectionComplete();
        // Clean up URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    }
  }, [user]);

  const handleConnectionComplete = async () => {
    try {
      setIsConnecting(true);

      const response = await fetch("/api/calendar/google/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsConnected(true);
        alert(result.message || "Google Calendar connected successfully!");
      } else {
        console.error("Failed to connect Google Calendar:", result.error);
        alert(
          result.error || "Failed to connect Google Calendar. Please try again."
        );
      }
    } catch (error) {
      console.error("Error completing Google Calendar connection:", error);
      alert("Failed to connect Google Calendar. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnect = async () => {
    if (!canUseFeature) {
      router.push("/settings");
      return;
    }

    try {
      setIsConnecting(true);

      const response = await fetch("/api/auth/google/authorize");
      const data = await response.json();

      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error("Failed to get authorization URL");
      }
    } catch (error) {
      console.error("Error initiating Google Calendar connection:", error);
      alert("Failed to connect to Google Calendar. Please try again.");
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Google Calendar?")) {
      return;
    }

    try {
      setIsConnecting(true);

      const response = await fetch("/api/auth/google/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (response.ok) {
        setIsConnected(false);
        alert("Google Calendar disconnected successfully");
      } else {
        throw new Error("Failed to disconnect");
      }
    } catch (error) {
      console.error("Error disconnecting Google Calendar:", error);
      alert("Failed to disconnect Google Calendar. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={isConnected ? handleDisconnect : handleConnect}
        disabled={isConnecting}
        className={`
          flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg
          transition duration-200 border
          ${
            isConnected
              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              : canUseFeature
              ? "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 cursor-pointer"
              : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
          }
          ${isConnecting ? "opacity-50 cursor-not-allowed" : ""}
        `}
        title={
          !canUseFeature ? "Upgrade to Pro to connect Google Calendar" : ""
        }
      >
        <GoogleCalendarIcon connected={isConnected} />
        <span>
          {isConnecting
            ? "Connecting..."
            : isConnected
            ? "Connected"
            : "Connect Google Calendar"}
        </span>
        {!canUseFeature && <ProBadge />}
      </button>

      {showPaywall && (
        <ProPaywall
          onClose={() => setShowPaywall(false)}
          feature="Google Calendar Integration"
          description="Automatically sync your tasks with Google Calendar and never miss a deadline."
        />
      )}
    </>
  );
};

const GoogleCalendarIcon = ({ connected }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={connected ? "text-green-600" : "text-current"}
  >
    <path
      d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"
      fill="currentColor"
    />
  </svg>
);

const ProBadge = () => (
  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white">
    PRO
  </span>
);

export default GoogleCalendarButton;
