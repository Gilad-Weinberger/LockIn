"use client";

import { useState } from "react";
import Navbar from "@/components/ui/Navbar";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import ProfileSettings from "@/components/settings/ProfileSettings";
import BillingSettings from "@/components/settings/BillingSettings";
import AISettings from "@/components/settings/AISettings";
import PrioritizingRulesSettings from "@/components/settings/PrioritizingRulesSettings";
import SchedulingRulesSettings from "@/components/settings/SchedulingRulesSettings";
import CalendarSettings from "@/components/settings/CalendarSettings";

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState("profile");

  const renderActiveSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSettings />;
      case "billing":
        return <BillingSettings />;
      case "ai-settings":
        return <AISettings />;
      case "prioritizing-rules":
        return <PrioritizingRulesSettings />;
      case "scheduling-rules":
        return <SchedulingRulesSettings />;
      case "google-calendar":
        return <CalendarSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-8">
            {/* Sidebar Block */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <SettingsSidebar
                  activeSection={activeSection}
                  onSectionChange={setActiveSection}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {renderActiveSection()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
