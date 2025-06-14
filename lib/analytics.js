import { PostHog } from "posthog-node";

// Server-side PostHog client
let posthog;

export function getPostHogClient() {
  if (!posthog && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    });
  }
  return posthog;
}

// Analytics constants for consistent naming
export const ANALYTICS_EVENTS = {
  TASK_CREATED: "task_created",
  TASK_COMPLETED: "task_completed",
  TASK_UPDATED: "task_updated",
  TASK_DELETED: "task_deleted",
  MATRIX_VIEWED: "priority_matrix_viewed",
  MATRIX_UPDATED: "priority_matrix_updated",
  CALENDAR_VIEWED: "calendar_viewed",
  CALENDAR_EVENT_CREATED: "calendar_event_created",
  USER_SIGNED_IN: "user_signed_in",
  USER_SIGNED_UP: "user_signed_up",
  USER_SIGNED_OUT: "user_signed_out",
};

export const ANALYTICS_PROPERTIES = {
  TASK_CATEGORY: "task_category",
  TASK_PRIORITY: "task_priority",
  HAS_DUE_DATE: "has_due_date",
  COMPLETION_TIME: "completion_time",
  MATRIX_TYPE: "matrix_type",
  ACTION: "action",
  AUTH_METHOD: "auth_method",
};
