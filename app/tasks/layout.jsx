import {
  generateMetadata as createMetadata,
  generateStructuredData,
} from "@/lib/seo-utils";

// Enhanced metadata for the tasks page
export const metadata = createMetadata({
  title: "Task Management - Organize & Prioritize Your Work",
  description:
    "Streamline your workflow with LockIn's intelligent task management. Create, organize, and prioritize tasks with AI-powered insights and seamless calendar integration.",
  path: "/tasks",
  keywords: [
    "task management",
    "task organization",
    "task prioritization",
    "to-do list",
    "productivity tools",
    "task tracking",
    "work organization",
    "task scheduler",
  ],
  type: "website",
});

// Structured data for task management functionality
const tasksStructuredData = generateStructuredData("SoftwareApplication", {
  applicationCategory: "ProductivityApplication",
  applicationSubCategory: "TaskManagement",
  featureList: [
    "Task creation and editing",
    "Task categorization",
    "Priority assignment",
    "Deadline tracking",
    "Task status management",
    "AI-powered task insights",
    "Calendar integration",
    "Task analytics",
  ],
  softwareRequirements: "Web Browser",
  operatingSystem: "Cross-platform",
});

export default function TasksLayout({ children }) {
  return (
    <>
      {/* Structured Data for Tasks */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(tasksStructuredData),
        }}
      />
      {children}
    </>
  );
}
