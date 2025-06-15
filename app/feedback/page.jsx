"use client";

import { useState } from "react";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import FeedbackFilters from "@/components/feedback/FeedbackFilters";
import FeedbackList from "@/components/feedback/FeedbackList";
import DropdownMenu from "@/components/ui/DropdownMenu";
import Navbar from "@/components/home/Navbar";

export default function FeedbackPage() {
  const [activeFilter, setActiveFilter] = useState("recent");
  const [showHandled, setShowHandled] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({});

  const handleFeatureAdded = () => {
    // Trigger a refresh of the feedback list
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleStatsUpdate = (newStats) => {
    setStats(newStats);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Centered Main Content */}
      <div className="flex items-center justify-center py-8">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feedback Form - Left Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <FeedbackForm onFeatureAdded={handleFeatureAdded} />
              </div>
            </div>

            {/* Feedback List - Right Column */}
            <div className="lg:col-span-2">
              <FeedbackFilters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                showHandled={showHandled}
                onToggleHandled={setShowHandled}
                stats={stats}
              />

              <FeedbackList
                activeFilter={activeFilter}
                showHandled={showHandled}
                refreshTrigger={refreshTrigger}
                onStatsUpdate={handleStatsUpdate}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown Menu - Fixed Bottom Left */}
      <div className="fixed bottom-6 left-6 z-50">
        <DropdownMenu />
      </div>
    </div>
  );
}
