"use client";

import { useParams } from "next/navigation";
import ProfileSettings from "@/components/settings/ProfileSettings";
import BillingSettings from "@/components/settings/BillingSettings";
import AISettings from "@/components/settings/AISettings";
import PrioritizingRulesSettings from "@/components/settings/PrioritizingRulesSettings";
import SchedulingRulesSettings from "@/components/settings/SchedulingRulesSettings";
import CalendarSettings from "@/components/settings/CalendarSettings";

const SettingsSectionPage = () => {
  const params = useParams();
  const { section } = params;

  switch (section) {
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

export default SettingsSectionPage;
