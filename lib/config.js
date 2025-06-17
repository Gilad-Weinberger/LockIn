// LemonSqueezy Configuration
const config = {
  lemonsqueezy: {
    plans: [
      {
        name: "Professional",
        variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID,
        priceId: "pro-monthly",
      },
      {
        name: "Professional Annual",
        variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID,
        priceId: "pro-yearly",
      },
      {
        name: "Enterprise",
        variantId:
          process.env.NEXT_PUBLIC_LEMONSQUEEZY_ENTERPRISE_MONTHLY_VARIANT_ID,
        priceId: "enterprise-monthly",
      },
      {
        name: "Enterprise Annual",
        variantId:
          process.env.NEXT_PUBLIC_LEMONSQUEEZY_ENTERPRISE_YEARLY_VARIANT_ID,
        priceId: "enterprise-yearly",
      },
    ],
  },
};

export default config;
