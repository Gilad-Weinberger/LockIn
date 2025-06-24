import { Rubik } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  generateMetadata as createMetadata,
  generateStructuredData,
} from "@/lib/seo-utils";

const rubik = Rubik({
  subsets: ["latin"],
  weights: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-rubik",
});

// Enhanced metadata using our SEO utility
export const metadata = createMetadata({
  title: null, // This will use the default site title
  description:
    "Transform your productivity with AI-powered task scheduling. Turn your to-do list into an organized calendar in seconds with smart prioritization and seamless calendar integration.",
  path: "",
  keywords: [
    "AI scheduling",
    "smart calendar",
    "productivity automation",
    "task prioritization",
    "Google Calendar integration",
    "time blocking",
    "focus enhancement",
  ],
});

// Generate structured data for the application
const structuredData = generateStructuredData("WebApplication", {
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web Browser, iOS, Android",
  features: [
    "AI-powered task scheduling",
    "Calendar integration",
    "Priority matrix",
    "Task management",
    "Time blocking",
    "Focus tracking",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1250",
    bestRating: "5",
    worstRating: "1",
  },
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={rubik.variable}>
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Additional meta tags for better SEO */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="color-scheme" content="light dark" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LockIn" />
        {/* Favicon and app icons */}
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${rubik.className} antialiased`}>
        <Providers>
          {children}
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
