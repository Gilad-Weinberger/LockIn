"use client";
import { AuthProvider } from "@/context/AuthContext";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only", // or always to track anonymous users
  });
}

export function Providers({ children }) {
  return (
    <PostHogProvider client={posthog}>
      <AuthProvider>{children}</AuthProvider>
    </PostHogProvider>
  );
}
