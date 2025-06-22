import posthog from "posthog-js";

if (typeof window !== "undefined" && !posthog.__initialized) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
    loaded: (ph) => {
      console.log("PostHog loaded");
    },
    // Enable debug mode in development
    debug: process.env.NODE_ENV === "development",
    // Capture pageviews automatically
    capture_pageview: true,
    // Disable session recording by default (you can enable if needed)
    disable_session_recording: false,
  });

  posthog.__initialized = true; // avoid double init in HMR
}

export default posthog;
