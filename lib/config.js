// LemonSqueezy Configuration
const config = {
  lemonsqueezy: {
    plans: [
      {
        name: "Professional",
        variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID,
        priceId: "pro-monthly",
        features: ["unlimited_tasks", "ai_scheduling", "calendar_integration"],
      },
      {
        name: "Professional Annual",
        variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID,
        priceId: "pro-yearly",
        features: ["unlimited_tasks", "ai_scheduling", "calendar_integration"],
      },
      {
        name: "Enterprise",
        variantId:
          process.env.NEXT_PUBLIC_LEMONSQUEEZY_ENTERPRISE_MONTHLY_VARIANT_ID,
        priceId: "enterprise-monthly",
        features: [
          "unlimited_tasks",
          "ai_scheduling",
          "calendar_integration",
          "advanced_analytics",
          "priority_support",
        ],
      },
      {
        name: "Enterprise Annual",
        variantId:
          process.env.NEXT_PUBLIC_LEMONSQUEEZY_ENTERPRISE_YEARLY_VARIANT_ID,
        priceId: "enterprise-yearly",
        features: [
          "unlimited_tasks",
          "ai_scheduling",
          "calendar_integration",
          "advanced_analytics",
          "priority_support",
        ],
      },
    ],
  },
};

export default config;
