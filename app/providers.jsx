"use client";
import { AuthProvider } from "@/context/AuthContext";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

function PHProvider({ children }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        person_profiles: "identified_only",
        loaded: (posthog) => {
          if (process.env.NODE_ENV === "development")
            console.log("PostHog loaded");
        },
      });
    }
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

export function Providers({ children }) {
  return (
    <PHProvider>
      <AuthProvider>{children}</AuthProvider>
    </PHProvider>
  );
}
