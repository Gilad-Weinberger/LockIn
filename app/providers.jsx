"use client";

import { AuthProvider } from "@/context/AuthContext";
import posthog from "posthog-js";
import { useEffect } from "react";
import { PostHogProvider as PHProvider } from "posthog-js/react";

export function PostHogProvider({ children }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
      defaults: "2025-05-24",
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <AuthProvider>{children}</AuthProvider>
    </PHProvider>
  );
}
