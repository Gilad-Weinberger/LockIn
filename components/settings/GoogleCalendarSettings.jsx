"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { canAccessFeature } from "@/lib/utils/subscription-utils";
import { useRouter } from "next/navigation";

const GoogleCalendarSettings = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [calendarName, setCalendarName] = useState("");
  const [connectedAt, setConnectedAt] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [canUseFeature, setCanUseFeature] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkFeatureAndLoadSettings = async () => {
      if (user?.uid) {
        try {
          // Check feature access
          const hasAccess = await canAccessFeature(user.uid, "google_calendar");
          setCanUseFeature(hasAccess);

          // Load current settings
          const response = await fetch(
            `/api/calendar/google/settings?userId=${user.uid}`
          );
          if (response.ok) {
            const data = await response.json();
            setIsConnected(data.connected);
            setAutoSync(data.autoSync);
            setCalendarName(data.calendarName || "");
            setConnectedAt(data.connectedAt);
          }
        } catch (error) {
          console.error("Error loading Google Calendar settings:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkFeatureAndLoadSettings();
  }, [user]);

  // Redirect to billing whenever paywall is triggered
  useEffect(() => {
    if (showPaywall) {
      router.push("/settings/billing");
    }
  }, [showPaywall, router]);

  // Note: Google Calendar connection completion is now handled by useGoogleCalendarConnection hook on the calendar page

  const handleConnectionComplete = async (connectionData) => {
    try {
      setIsConnecting(true);

      const tokens = {
        access_token: connectionData.accessToken,
        refresh_token: connectionData.refreshToken,
        expiry_date: connectionData.expiryDate,
      };

      const calendarInfo = {
        summary: connectionData.calendarName,
      };

      const response = await fetch("/api/calendar/google/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          tokens,
          calendarInfo,
        }),
      });

      if (response.ok) {
        setIsConnected(true);
        setCalendarName(connectionData.calendarName);
        setConnectedAt(new Date().toISOString());
        alert("Google Calendar connected successfully!");
      } else {
        console.error("Failed to save Google Calendar connection");
        alert("Failed to connect Google Calendar. Please try again.");
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
      setShowPaywall(true);
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
        setAutoSync(false);
        setCalendarName("");
        setConnectedAt(null);
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

  const handleAutoSyncToggle = async (enabled) => {
    if (!canUseFeature && enabled) {
      setShowPaywall(true);
      return;
    }

    try {
      const response = await fetch("/api/calendar/google/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          autoSync: enabled,
        }),
      });

      if (response.ok) {
        setAutoSync(enabled);
      } else {
        const error = await response.json();
        if (response.status === 403) {
          setShowPaywall(true);
        } else {
          alert("Failed to update auto-sync setting. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error updating auto-sync setting:", error);
      alert("Failed to update auto-sync setting. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Google Calendar Integration
            </h2>
            <p className="text-gray-600 mt-1">
              Sync your tasks with Google Calendar automatically
            </p>
          </div>
          {!canUseFeature && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              PRO Feature
            </span>
          )}
        </div>

        {/* Connection Status */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
              <div>
                <p className="font-medium text-gray-900">
                  {isConnected ? "Connected" : "Not Connected"}
                </p>
                {isConnected && calendarName && (
                  <p className="text-sm text-gray-600">
                    Calendar: {calendarName}
                  </p>
                )}
                {isConnected && connectedAt && (
                  <p className="text-xs text-gray-500">
                    Connected {new Date(connectedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={isConnected ? handleDisconnect : handleConnect}
              disabled={isConnecting}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg transition duration-200
                ${
                  isConnected
                    ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                    : canUseFeature
                    ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                    : "bg-gray-50 text-gray-400 border border-gray-200 cursor-pointer"
                }
                ${isConnecting ? "opacity-50 cursor-not-allowed" : ""}
              `}
              title={
                !canUseFeature
                  ? "Upgrade to Pro to connect Google Calendar"
                  : ""
              }
            >
              {isConnecting
                ? "Processing..."
                : isConnected
                ? "Disconnect"
                : "Connect Google Calendar"}
              {!canUseFeature && !isConnected && (
                <span className="ml-2 text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full">
                  PRO
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Auto-sync Setting */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-base font-medium text-gray-900">
                Automatic Event Sync
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Automatically add new tasks to your Google Calendar when created
              </p>
              {!canUseFeature && (
                <p className="text-xs text-orange-600 mt-1">
                  Upgrade to Pro to enable auto-sync
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {!canUseFeature && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  PRO
                </span>
              )}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => handleAutoSyncToggle(e.target.checked)}
                  disabled={!isConnected || (!canUseFeature && !autoSync)}
                  className="sr-only peer"
                />
                <div
                  className={`
                  relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
                  ${
                    !isConnected || (!canUseFeature && !autoSync)
                      ? "bg-gray-200"
                      : autoSync
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  }
                  peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300
                `}
                >
                  <div
                    className={`
                    absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 
                    transition-transform duration-200 ease-in-out
                    ${autoSync ? "translate-x-full" : "translate-x-0"}
                  `}
                  ></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-xs text-gray-500">
          <p>
            <strong>Note:</strong> Google Calendar integration is a Pro feature.
            Auto-sync will automatically create calendar events when you add new
            tasks.
          </p>
        </div>
      </div>

      {/* Paywall handled via redirect above */}
    </>
  );
};

export default GoogleCalendarSettings;
