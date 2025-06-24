import {
  generateMetadata as createMetadata,
  generateStructuredData,
} from "@/lib/seo-utils";

// Enhanced metadata for the calendar page
export const metadata = createMetadata({
  title: "Smart Calendar - AI-Powered Task Scheduling",
  description:
    "Experience intelligent calendar management with LockIn's AI-powered scheduling. Automatically organize your tasks, block time, and sync with Google Calendar for maximum productivity.",
  path: "/calendar",
  keywords: [
    "smart calendar",
    "AI calendar scheduling",
    "automatic time blocking",
    "Google Calendar integration",
    "calendar management",
    "task scheduling",
    "productivity calendar",
    "intelligent planning",
  ],
  type: "website",
});

// Structured data for calendar functionality
const calendarStructuredData = generateStructuredData("SoftwareApplication", {
  applicationCategory: "ProductivityApplication",
  applicationSubCategory: "Calendar",
  featureList: [
    "AI-powered task scheduling",
    "Google Calendar integration",
    "Automatic time blocking",
    "Smart task prioritization",
    "Calendar view customization",
    "Task deadline tracking",
    "Focus time optimization",
  ],
  softwareRequirements: "Web Browser",
  operatingSystem: "Cross-platform",
});

export default function CalendarLayout({ children }) {
  return (
    <>
      {/* Structured Data for Calendar */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(calendarStructuredData),
        }}
      />
      {children}
    </>
  );
}
