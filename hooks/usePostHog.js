"use client";
import { usePostHog as usePostHogBase } from "posthog-js/react";

export function usePostHog() {
  return usePostHogBase();
}

export function useAnalytics() {
  const posthog = usePostHogBase();

  const identify = (userId, properties = {}) => {
    if (posthog) {
      posthog.identify(userId, properties);
    }
  };

  const capture = (eventName, properties = {}) => {
    if (posthog) {
      posthog.capture(eventName, properties);
    }
  };

  const captureTaskCreated = (taskData) => {
    capture("task_created", {
      task_category: taskData.category,
      task_priority: taskData.priority,
      has_due_date: !!taskData.dueDate,
    });
  };

  const captureTaskCompleted = (taskData) => {
    capture("task_completed", {
      task_category: taskData.category,
      task_priority: taskData.priority,
      completion_time: taskData.completionTime,
    });
  };

  const captureMatrixUsed = (matrixType) => {
    capture("priority_matrix_used", {
      matrix_type: matrixType,
    });
  };

  const captureCalendarInteraction = (action) => {
    capture("calendar_interaction", {
      action: action,
    });
  };

  return {
    identify,
    capture,
    captureTaskCreated,
    captureTaskCompleted,
    captureMatrixUsed,
    captureCalendarInteraction,
  };
}
