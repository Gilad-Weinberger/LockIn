"use client";

import { useState } from "react";
import Navbar from "@/components/ui/navbar/Navbar";
import DropdownMenu from "@/components/ui/DropdownMenu";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import ProfileSettings from "@/components/settings/ProfileSettings";
import BillingSettings from "@/components/settings/BillingSettings";
import PrioritizingRulesSettings from "@/components/settings/PrioritizingRulesSettings";
import SchedulingRulesSettings from "@/components/settings/SchedulingRulesSettings";

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState("profile");

  const renderActiveSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSettings />;
      case "billing":
        return <BillingSettings />;
      case "prioritizing-rules":
        return <PrioritizingRulesSettings />;
      case "scheduling-rules":
        return <SchedulingRulesSettings />;
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
