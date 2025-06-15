"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const ProfileSettings = () => {
  const { user, userData, refreshUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || "",
        email: userData.email || "",
      });
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        fullName: formData.fullName,
        updatedAt: new Date().toISOString(),
      });
      
      await refreshUserData();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || "",
        email: userData.email || "",
      });
    }
    setIsEditing(false);
  };

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
        <div className="bg-white rounded-lg border border-gray-200 p-6">
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
                  : "Unknown"
                }
              </p>
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
      </div>
    </div>
  );
};

export default ProfileSettings; 