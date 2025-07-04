// SEO utility functions for generating metadata across the application

const SITE_CONFIG = {
  name: "LockIn",
  title: "LockIn - Focus & Productivity App",
  description:
    "LockIn helps you stay focused and productive with advanced task management, calendar integration, and priority matrices.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://lockintasks.com",
  ogImage: "/og-image.jpg",
  creator: "@lockinapp",
  keywords: [
    "productivity app",
    "task management",
    "calendar integration",
    "focus app",
    "time management",
    "priority matrix",
    "scheduling",
    "productivity tools",
    "task scheduler",
    "work organization",
  ],
};

/**
 * Generate base metadata for pages
 * @param {Object} options - Metadata options
 * @param {string} options.title - Page title
 * @param {string} options.description - Page description
 * @param {string} options.path - Page path
 * @param {string[]} options.keywords - Additional keywords
 * @param {string} options.ogImage - Open Graph image URL
 * @param {string} options.type - Open Graph type
 * @returns {Object} Metadata object
 */
export const generateMetadata = ({
  title,
  description = SITE_CONFIG.description,
  path = "",
  keywords = [],
  ogImage = SITE_CONFIG.ogImage,
  type = "website",
} = {}) => {
  // Format page titles as "LockIn - PageTitle" for consistency
  const pageTitle = title
    ? `${title} | ${SITE_CONFIG.name}`
    : SITE_CONFIG.title;
  const url = `${SITE_CONFIG.url}${path}`;
  const allKeywords = [...SITE_CONFIG.keywords, ...keywords];

  return {
    title: pageTitle,
    description,
    keywords: allKeywords.join(", "),
    authors: [{ name: SITE_CONFIG.name, url: SITE_CONFIG.url }],
    creator: SITE_CONFIG.creator,
    publisher: SITE_CONFIG.name,
    metadataBase: new URL(SITE_CONFIG.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      locale: "en_US",
      url,
      title: pageTitle,
      description,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: ogImage.startsWith("http")
            ? ogImage
            : `${SITE_CONFIG.url}${ogImage}`,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      creator: SITE_CONFIG.creator,
      images: [
        ogImage.startsWith("http") ? ogImage : `${SITE_CONFIG.url}${ogImage}`,
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
    },
  };
};

/**
 * Generate structured data for the application
 * @param {string} type - Schema.org type
 * @param {Object} data - Additional data
 * @returns {Object} JSON-LD structured data
 */
export const generateStructuredData = (type = "WebApplication", data = {}) => {
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@type": type,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    ...data,
  };

  return baseStructuredData;
};

/**
 * Generate FAQ structured data
 * @param {Array} faqs - Array of FAQ objects with question and answer
 * @returns {Object} FAQ JSON-LD structured data
 */
export const generateFAQStructuredData = (faqs) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
};

/**
 * Generate breadcrumb structured data
 * @param {Array} breadcrumbs - Array of breadcrumb objects with name and url
 * @returns {Object} Breadcrumb JSON-LD structured data
 */
export const generateBreadcrumbStructuredData = (breadcrumbs) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.name,
      item: `${SITE_CONFIG.url}${breadcrumb.url}`,
    })),
  };
};

export { SITE_CONFIG };
