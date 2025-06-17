"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile } from "@/lib/functions/userFunctions";
import { getUserSubscriptionLevel } from "@/lib/utils/subscription-utils";

const ProfileSettings = () => {
  const { user, userData, refreshUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    autoPrioritize: true,
    autoSchedule: true,
  });
  const [subscriptionLevel, setSubscriptionLevel] = useState(null);

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || "",
        email: userData.email || "",
        autoPrioritize: userData.autoPrioritize !== false, // Default to true if not set
        autoSchedule: userData.autoSchedule !== false, // Default to true if not set
      });
    }
  }, [userData]);

  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (!user) return;

      try {
        const level = await getUserSubscriptionLevel(user.uid);
        setSubscriptionLevel(level);
      } catch (error) {
        console.error("Error fetching subscription level:", error);
      }
    };

    fetchTokenInfo();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, {
        fullName: formData.fullName,
        autoPrioritize: formData.autoPrioritize,
        autoSchedule: formData.autoSchedule,
      });

      await refreshUserData();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || "",
        email: userData.email || "",
        autoPrioritize: userData.autoPrioritize !== false,
        autoSchedule: userData.autoSchedule !== false,
      });
    }
    setIsEditing(false);
  };

  // Get tokens used from userData
  const prioritizationTokensUsed = userData?.aiPrioritizationTokensUsed || 0;
  const schedulingTokensUsed = userData?.aiSchedulingTokensUsed || 0;

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Profile</h2>
          <p className="text-gray-600">
            Manage your account settings and personal information.
          </p>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-gray-900 py-2">
                  {userData?.fullName || "No name provided"}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <p className="text-gray-500 py-2">
                {userData?.email || "No email provided"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Email cannot be changed from this interface
              </p>
            </div>

            {/* Member Since */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member Since
              </label>
              <p className="text-gray-900 py-2">
                {userData?.createdAt
                  ? new Date(userData.createdAt).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>

            {/* Auto AI Preferences */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                AI Automation Preferences
              </h4>

              {/* Auto Prioritize Toggle */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Auto-Prioritize
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically prioritize tasks when entering the Matrix page
                  </p>
                </div>
                {isEditing ? (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="autoPrioritize"
                      checked={formData.autoPrioritize}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                ) : (
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      formData.autoPrioritize
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {formData.autoPrioritize ? "Enabled" : "Disabled"}
                  </span>
                )}
              </div>

              {/* Auto Schedule Toggle */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Auto-Schedule
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically schedule tasks when entering the Calendar page
                  </p>
                </div>
                {isEditing ? (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="autoSchedule"
                      checked={formData.autoSchedule}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                ) : (
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      formData.autoSchedule
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {formData.autoSchedule ? "Enabled" : "Disabled"}
                  </span>
                )}
              </div>
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
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* AI Token Usage for Free Users - Moved to Bottom */}
        {subscriptionLevel === "free" && userData && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              AI Usage
            </h3>

            {/* AI Prioritization Tokens */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-800">
                    AI Prioritization Tasks Used
                  </span>
                  <span className="text-blue-600 font-bold">
                    {prioritizationTokensUsed}/25
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(prioritizationTokensUsed / 25) * 100}%`,
                    }}
                  ></div>
                </div>
                {prioritizationTokensUsed >= 25 && (
                  <p className="text-xs text-red-600 mt-2">
                    Limit reached. Upgrade to Pro for unlimited AI task
                    prioritization.
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-2">
                  Each task prioritized by AI counts as 1 token
                </p>
              </div>
            </div>

            {/* AI Scheduling Tokens */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-800">
                    AI Scheduling Tasks Used
                  </span>
                  <span className="text-green-600 font-bold">
                    {schedulingTokensUsed}/25
                  </span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(schedulingTokensUsed / 25) * 100}%` }}
                  ></div>
                </div>
                {schedulingTokensUsed >= 25 && (
                  <p className="text-xs text-red-600 mt-2">
                    Limit reached. Upgrade to Pro for unlimited AI task
                    scheduling.
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-2">
                  Each task scheduled by AI counts as 1 token
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
