import {
  Navbar,
  HeroSection,
  HowItWorks,
  Features,
  Testimonials,
  Pricing,
  FAQ,
  Footer,
} from "@/components/home";
import {
  generateMetadata as createMetadata,
  generateStructuredData,
  generateFAQStructuredData,
} from "@/lib/seo-utils";

// Enhanced metadata for the home page
export const metadata = createMetadata({
  title: "AI-Powered Task Scheduling & Calendar Integration",
  description:
    "Transform your productivity with LockIn's AI-powered task scheduling. Turn your to-do list into an organized calendar in seconds with smart prioritization and seamless Google Calendar integration.",
  path: "",
  keywords: [
    "AI task scheduler",
    "automatic calendar blocking",
    "productivity automation",
    "smart task management",
    "calendar optimization",
    "time management app",
    "focus app",
    "task prioritization tool",
  ],
  type: "website",
});

// Structured data for the homepage
const homepageStructuredData = generateStructuredData("WebApplication", {
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web Browser",
  offers: [
    {
      "@type": "Offer",
      name: "Free Plan",
      price: "0",
      priceCurrency: "USD",
      description: "Basic task management and calendar integration",
    },
    {
      "@type": "Offer",
      name: "Pro Plan",
      price: "9.99",
      priceCurrency: "USD",
      description: "Advanced AI features and unlimited integrations",
    },
  ],
  featureList: [
    "AI-powered task scheduling",
    "Google Calendar integration",
    "Priority matrix visualization",
    "Automatic time blocking",
    "Smart task prioritization",
    "Focus time tracking",
    "Task analytics and insights",
  ],
});

// FAQ structured data for better search visibility
const faqData = generateFAQStructuredData([
  {
    question: "How does LockIn's AI scheduling work?",
    answer:
      "LockIn uses advanced AI algorithms to analyze your tasks, deadlines, and calendar availability to automatically schedule your work in optimal time blocks.",
  },
  {
    question: "Can I integrate LockIn with Google Calendar?",
    answer:
      "Yes! LockIn seamlessly integrates with Google Calendar to sync your scheduled tasks and existing events.",
  },
  {
    question: "Is LockIn free to use?",
    answer:
      "LockIn offers a free plan with basic features. Pro plans with advanced AI capabilities are available for enhanced productivity.",
  },
  {
    question: "How does the priority matrix work?",
    answer:
      "Our priority matrix uses the Eisenhower method to categorize tasks by urgency and importance, helping you focus on what matters most.",
  },
]);

export default function Home() {
  return (
    <>
      {/* Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homepageStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqData),
        }}
      />

      <div className="min-h-screen">
        <Navbar />
        <main>
          <HeroSection />
          <HowItWorks />
          <Features />
          {/* <Testimonials /> */}
          <Pricing />
          <FAQ />
        </main>
        <Footer />
      </div>
    </>
  );
}
