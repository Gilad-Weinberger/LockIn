import {
  generateMetadata as createMetadata,
  generateStructuredData,
} from "@/lib/seo-utils";

// Enhanced metadata for the pricing page
export const metadata = createMetadata({
  title: "Pricing Plans - Choose Your Productivity Plan",
  description:
    "Choose the perfect LockIn plan for your productivity needs. Start free with basic task management or upgrade to Pro for advanced AI scheduling and unlimited integrations.",
  path: "/pricing",
  keywords: [
    "pricing plans",
    "productivity app pricing",
    "task management pricing",
    "calendar app cost",
    "subscription plans",
    "free productivity app",
    "pro productivity features",
  ],
  type: "website",
});

// Structured data for pricing
const pricingStructuredData = generateStructuredData("WebApplication", {
  offers: [
    {
      "@type": "Offer",
      name: "Free Plan",
      price: "0",
      priceCurrency: "USD",
      priceValidUntil: "2025-12-31",
      description: "Perfect for individuals getting started with productivity",
      category: "Free",
      eligibleRegion: "Worldwide",
      itemOffered: {
        "@type": "Service",
        name: "LockIn Free",
        description: "Basic task management and calendar integration",
      },
      includesObject: [
        {
          "@type": "TypeAndQuantityNode",
          amountOfThisGood: "Unlimited",
          typeOfGood: "Basic Tasks",
        },
        {
          "@type": "TypeAndQuantityNode",
          amountOfThisGood: "1",
          typeOfGood: "Calendar Integration",
        },
      ],
    },
    {
      "@type": "Offer",
      name: "Pro Plan",
      price: "9.99",
      priceCurrency: "USD",
      billingIncrement: "Monthly",
      priceValidUntil: "2025-12-31",
      description: "Advanced features for power users and teams",
      category: "Premium",
      eligibleRegion: "Worldwide",
      itemOffered: {
        "@type": "Service",
        name: "LockIn Pro",
        description: "Advanced AI features and unlimited integrations",
      },
      includesObject: [
        {
          "@type": "TypeAndQuantityNode",
          amountOfThisGood: "Unlimited",
          typeOfGood: "AI-Powered Tasks",
        },
        {
          "@type": "TypeAndQuantityNode",
          amountOfThisGood: "Unlimited",
          typeOfGood: "Calendar Integrations",
        },
        {
          "@type": "TypeAndQuantityNode",
          amountOfThisGood: "1",
          typeOfGood: "Priority Support",
        },
      ],
    },
  ],
});

export default function PricingLayout({ children }) {
  return (
    <>
      {/* Structured Data for Pricing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pricingStructuredData),
        }}
      />
      {children}
    </>
  );
}
