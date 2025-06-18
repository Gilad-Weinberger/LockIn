"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { canAccessFeature } from "@/lib/utils/subscription-utils";
import { connectGoogleCalendar } from "@/lib/functions/googleCalendarFunctions";
import ProPaywall from "@/components/settings/ProPaywall";

const CalendarSettings = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [settings, setSettings] = useState({
    connected: false,
    autoSync: false,
    showGoogleEvents: true,
    calendarName: "",
    connectedAt: null,
  });
  const [showPaywall, setShowPaywall] = useState(false);
  const [canUseFeature, setCanUseFeature] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
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
            setSettings({
              connected: data.connected || false,
              autoSync: data.autoSync || false,
              showGoogleEvents: data.showGoogleEvents !== false,
              calendarName: data.calendarName || "",
              connectedAt: data.connectedAt,
            });
          }
        } catch (error) {
          console.error("Error loading calendar settings:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadSettings();
  }, [user]);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (response.ok) {
        setSettings((prev) => ({
          ...prev,
          connected: false,
          autoSync: false,
          calendarName: "",
          connectedAt: null,
        }));
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

  const handleToggleSetting = async (settingName, enabled) => {
    if (!canUseFeature && enabled) {
      setShowPaywall(true);
      return;
    }

    try {
      const response = await fetch("/api/calendar/google/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          [settingName]: enabled,
        }),
      });

      if (response.ok) {
        setSettings((prev) => ({ ...prev, [settingName]: enabled }));
      } else {
        const error = await response.json();
        if (response.status === 403) {
          setShowPaywall(true);
        } else {
          alert(`Failed to update ${settingName} setting. Please try again.`);
        }
      }
    } catch (error) {
      console.error(`Error updating ${settingName} setting:`, error);
      alert(`Failed to update ${settingName} setting. Please try again.`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Calendar Settings
            </h2>
            <p className="text-gray-600 mt-1">
              Manage your calendar integrations and preferences
            </p>
          </div>
          {!canUseFeature && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              PRO Feature
            </span>
          )}
        </div>

        {/* Google Calendar Connection Block */}
        <div className="bg-gray-50 rounded-lg border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Google Calendar Integration
            </h3>

            {/* Connection Status */}
            <div className="bg-white rounded-lg p-4 mb-4 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      settings.connected ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {settings.connected ? "Connected" : "Not Connected"}
                    </p>
                    {settings.connected && settings.calendarName && (
                      <p className="text-sm text-gray-600">
                        Calendar: {settings.calendarName}
                      </p>
                    )}
                    {settings.connected && settings.connectedAt && (
                      <p className="text-xs text-gray-500">
                        Connected{" "}
                        {new Date(settings.connectedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={
                    settings.connected ? handleDisconnect : handleConnect
                  }
                  disabled={
                    isConnecting || (!canUseFeature && !settings.connected)
                  }
                  className={`
                    px-4 py-2 text-sm font-medium rounded-lg transition duration-200 border
                    ${
                      settings.connected
                        ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        : canUseFeature
                        ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                        : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
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
                    : settings.connected
                    ? "Disconnect"
                    : "Connect Google Calendar"}
                </button>
              </div>
            </div>

            {/* Settings Toggles */}
            <div className="space-y-4">
              {/* Auto-sync Setting */}
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="text-base font-medium text-gray-900">
                      Automatic Task Sync
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Automatically create Google Calendar events when you add
                      new tasks
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
                        checked={settings.autoSync}
                        onChange={(e) =>
                          handleToggleSetting("autoSync", e.target.checked)
                        }
                        disabled={
                          !settings.connected ||
                          (!canUseFeature && !settings.autoSync)
                        }
                        className="sr-only peer"
                      />
                      <div
                        className={`
                          relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
                          ${
                            !settings.connected ||
                            (!canUseFeature && !settings.autoSync)
                              ? "bg-gray-200"
                              : settings.autoSync
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
                            ${
                              settings.autoSync
                                ? "translate-x-full"
                                : "translate-x-0"
                            }
                          `}
                        ></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Show Google Calendar Events Setting */}
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="text-base font-medium text-gray-900">
                      Show Google Calendar Events
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Display your Google Calendar events in the LockIn calendar
                      view
                    </p>
                    {!canUseFeature && (
                      <p className="text-xs text-orange-600 mt-1">
                        Upgrade to Pro to show Google Calendar events
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
                        checked={settings.showGoogleEvents}
                        onChange={(e) =>
                          handleToggleSetting(
                            "showGoogleEvents",
                            e.target.checked
                          )
                        }
                        disabled={
                          !settings.connected ||
                          (!canUseFeature && !settings.showGoogleEvents)
                        }
                        className="sr-only peer"
                      />
                      <div
                        className={`
                          relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
                          ${
                            !settings.connected ||
                            (!canUseFeature && !settings.showGoogleEvents)
                              ? "bg-gray-200"
                              : settings.showGoogleEvents
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
                            ${
                              settings.showGoogleEvents
                                ? "translate-x-full"
                                : "translate-x-0"
                            }
                          `}
                        ></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Block */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900">
                About Calendar Integration
              </h4>
              <div className="mt-2 text-sm text-blue-800 space-y-1">
                <p>
                  <strong>Auto-sync:</strong> Automatically creates Google
                  Calendar events when you add new tasks.
                </p>
                <p>
                  <strong>Show Events:</strong> Displays your existing Google
                  Calendar events alongside your tasks in the calendar view.
                </p>
                <p>
                  <strong>Note:</strong> Calendar integration is a Pro feature.
                  Changes may take a few moments to sync between platforms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Paywall Modal */}
      {showPaywall && (
        <ProPaywall
          onClose={() => setShowPaywall(false)}
          feature="Google Calendar Integration"
          description="Sync your tasks with Google Calendar and view all your events in one place."
        />
      )}
    </>
  );
};

export default CalendarSettings;
