"use client";

import { useState } from "react";
import DropdownMenu from "@/components/ui/DropdownMenu";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import ProfileSettings from "@/components/settings/ProfileSettings";
import PrioritizingRulesSettings from "@/components/settings/PrioritizingRulesSettings";
import SchedulingRulesSettings from "@/components/settings/SchedulingRulesSettings";

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState("profile");

  const renderActiveSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSettings />;
      case "prioritizing-rules":
        return <PrioritizingRulesSettings />;
      case "scheduling-rules":
        return <SchedulingRulesSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <div className="h-full bg-gray-50 py-8 px-4 overflow-auto">
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

      {/* DropdownMenu - positioned absolutely */}
      <div className="absolute bottom-8 left-8 z-50">
        <DropdownMenu />
      </div>
    </div>
  );
};

export default SettingsPage;
