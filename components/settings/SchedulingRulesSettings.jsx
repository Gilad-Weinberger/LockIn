"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateSchedulingRules } from "@/lib/functions/userFunctions";
import {
  hasSubscriptionLevel,
  SUBSCRIPTION_LEVELS,
} from "@/lib/utils/subscription-utils";
import ProPaywall from "./ProPaywall";

const SchedulingRulesSettings = () => {
  const { user, userData, refreshUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [schedulingRules, setSchedulingRules] = useState("");
  const [isProfessionalUser, setIsProfessionalUser] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user?.uid) {
        setSubscriptionLoading(false);
        return;
      }

      try {
        const hasProfessional = await hasSubscriptionLevel(
          userData?.uid || userData?.id,
          SUBSCRIPTION_LEVELS.PRO
        );
        setIsProfessionalUser(hasProfessional);
      } catch (error) {
        console.error("Error checking subscription level:", error);
        setIsProfessionalUser(false);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    checkSubscription();
  }, [user?.uid, userData?.uid, userData?.id]);

  useEffect(() => {
    if (userData && isProfessionalUser) {
      setSchedulingRules(userData.schedulingRules || "");
    }
  }, [userData, isProfessionalUser]);

  const handleSave = async () => {
    if (!user || !isProfessionalUser) return;

    setIsSaving(true);
    try {
      await updateSchedulingRules(user.uid, schedulingRules);
      await refreshUserData();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating scheduling rules:", error);
      alert("Failed to update scheduling rules. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (userData && isProfessionalUser) {
      setSchedulingRules(userData.schedulingRules || "");
    }
    setIsEditing(false);
  };

  // Show loading state while checking subscription
  if (subscriptionLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show paywall for free users
  if (!isProfessionalUser) {
    return (
      <ProPaywall
        featureName="Custom Scheduling Rules"
        description="Define intelligent scheduling preferences to automatically organize your prioritized tasks based on your energy levels and optimal work patterns."
      />
    );
  }

  const defaultRulesText = `Enter your custom scheduling rules here. These rules will guide how tasks are automatically scheduled in your calendar.

Example rules:
• Morning hours (9-11 AM) are best for deep work and "DO" tasks
• Afternoon (2-4 PM) is ideal for meetings and collaborative work
• Schedule high-energy tasks earlier in the day
• Leave buffer time between meetings (15-30 minutes)
• Block Fridays for planning and review sessions
• Respect work-life balance - no work tasks after 6 PM

You can customize these rules based on your schedule preferences and energy patterns.`;

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Scheduling Rules
          </h2>
          <p className="text-gray-600">
            Define custom rules for how your prioritized tasks should be
            automatically scheduled in your calendar.
          </p>
        </div>

        {/* Information Card */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-green-800 mb-1">
                Smart Scheduling
              </h3>
              <p className="text-sm text-green-700">
                These rules help the AI understand your preferences when
                automatically scheduling your prioritized tasks based on your
                energy levels and availability.
              </p>
            </div>
          </div>
        </div>

        {/* Rules Form */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduling Rules
              </label>
              {isEditing ? (
                <textarea
                  value={schedulingRules}
                  onChange={(e) => setSchedulingRules(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  rows={12}
                  placeholder={defaultRulesText}
                />
              ) : (
                <div className="border border-gray-200 rounded-md p-3 bg-white min-h-[170px]">
                  {schedulingRules ? (
                    <pre className="text-gray-900 whitespace-pre-wrap text-sm">
                      {schedulingRules}
                    </pre>
                  ) : (
                    <p className="text-gray-500 italic">
                      No scheduling rules defined yet. Click "Edit Rules" to add
                      your custom scheduling preferences.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save Rules"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Edit Rules
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulingRulesSettings;
