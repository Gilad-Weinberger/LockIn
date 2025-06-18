"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { updatePrioritizingRules } from "@/lib/functions/userFunctions";
import {
  hasSubscriptionLevel,
  SUBSCRIPTION_LEVELS,
} from "@/lib/utils/subscription-utils";
import ProPaywall from "./ProPaywall";

const PrioritizingRulesSettings = () => {
  const { user, userData, refreshUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [prioritizingRules, setPrioritizingRules] = useState("");
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
        console.error("Error checking subscription:", error);
        setIsProfessionalUser(false);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    checkSubscription();
  }, [user?.uid, userData?.uid, userData?.id]);

  useEffect(() => {
    if (userData && isProfessionalUser) {
      setPrioritizingRules(userData.prioritizingRules || "");
    }
  }, [userData, isProfessionalUser]);

  const handleSave = async () => {
    if (!user || !isProfessionalUser) return;

    setIsSaving(true);
    try {
      await updatePrioritizingRules(user.uid, prioritizingRules);
      await refreshUserData();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating prioritizing rules:", error);
      alert("Failed to update prioritizing rules. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (userData && isProfessionalUser) {
      setPrioritizingRules(userData.prioritizingRules || "");
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
        featureName="Custom Prioritizing Rules"
        description="Create personalized AI rules to automatically prioritize your tasks based on your unique workflow and preferences."
      />
    );
  }

  const defaultRulesText = `Enter your custom prioritizing rules here. These rules will guide how tasks are automatically prioritized.

Example rules:
• Urgent deadlines within 24 hours should be prioritized as "DO"
• Tasks with high business impact should be in "DO" or "PLAN"  
• Routine maintenance tasks can be "DELEGATED"
• Non-essential tasks with no deadline can be "DELETED"

You can customize these rules based on your specific needs and workflow.`;

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Prioritizing Rules
          </h2>
          <p className="text-gray-600">
            Define custom rules for how your tasks should be automatically
            prioritized using the Eisenhower Matrix.
          </p>
        </div>

        {/* Information Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-1">
                How it works
              </h3>
              <p className="text-sm text-blue-700">
                These rules help the AI understand your priorities when
                automatically categorizing tasks into DO, PLAN, DELEGATE, or
                DELETE quadrants.
              </p>
            </div>
          </div>
        </div>

        {/* Rules Form */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioritizing Rules
              </label>
              {isEditing ? (
                <textarea
                  value={prioritizingRules}
                  onChange={(e) => setPrioritizingRules(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  rows={12}
                  placeholder={defaultRulesText}
                />
              ) : (
                <div className="border border-gray-200 rounded-md p-3 bg-white min-h-[170px]">
                  {prioritizingRules ? (
                    <pre className="text-gray-900 whitespace-pre-wrap text-sm">
                      {prioritizingRules}
                    </pre>
                  ) : (
                    <p className="text-gray-500 italic">
                      No prioritizing rules defined yet. Click "Edit Rules" to
                      add your custom rules.
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

export default PrioritizingRulesSettings;
