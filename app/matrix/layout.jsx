import {
  generateMetadata as createMetadata,
  generateStructuredData,
} from "@/lib/seo-utils";

// Enhanced metadata for the matrix page
export const metadata = createMetadata({
  title: "Priority Matrix - Eisenhower Matrix for Task Prioritization",
  description:
    "Master task prioritization with LockIn's interactive Eisenhower Matrix. Categorize tasks by urgency and importance to focus on what matters most for maximum productivity.",
  path: "/matrix",
  keywords: [
    "priority matrix",
    "Eisenhower matrix",
    "task prioritization",
    "urgent important matrix",
    "productivity framework",
    "task categorization",
    "priority management",
    "focus optimization",
  ],
  type: "website",
});

// Structured data for priority matrix functionality
const matrixStructuredData = generateStructuredData("SoftwareApplication", {
  applicationCategory: "ProductivityApplication",
  applicationSubCategory: "ProjectManagement",
  featureList: [
    "Eisenhower Matrix visualization",
    "Task prioritization framework",
    "Drag and drop task organization",
    "Priority-based task filtering",
    "Visual task categorization",
    "Productivity insights",
    "Focus optimization",
    "Task urgency assessment",
  ],
  softwareRequirements: "Web Browser",
  operatingSystem: "Cross-platform",
  about:
    "Interactive priority matrix based on the Eisenhower Decision Matrix for effective task prioritization and productivity management.",
});

export default function MatrixLayout({ children }) {
  return (
    <>
      {/* Structured Data for Matrix */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(matrixStructuredData),
        }}
      />
      {children}
    </>
  );
}
