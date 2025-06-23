import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  updateTask,
  updateNullPriorityTasks,
} from "@/lib/functions/taskFunctions";

export const useTaskFormSubmit = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState("");
  const { userData } = useAuth();

  const handleSubmit = async (
    formData,
    task,
    isGoogleCalendarEvent,
    onClose
  ) => {
    setIsLoading(true);
    setHasError("");

    try {
      const {
        title,
        startDate,
        startTime,
        endDate,
        endTime,
        category,
        taskType,
        isDone,
        aiScheduleLocked,
      } = formData;

      if (isGoogleCalendarEvent) {
        // Handle Google Calendar event update
        const startDateTime = new Date(`${startDate}T${startTime || "00:00"}`);
        const endDateTime = new Date(`${endDate}T${endTime || "23:59"}`);

        const eventData = {
          summary: title, // Google Calendar uses 'summary' for title
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        };

        const requestBody = {
          userId: userData?.uid || userData?.id,
          googleEventId: task?.id,
          eventData,
        };

        // Debug logging (can be removed in production)
        console.log("Updating Google Calendar event:", task.id);

        // Call Google Calendar API to update the event
        const response = await fetch("/api/calendar/google/sync", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to update Google Calendar event"
          );
        }

        // Google Calendar events will be refreshed automatically by our new integration
      } else {
        // Handle regular task update
        const startDateTime = new Date(`${startDate}T${startTime || "00:00"}`);
        const endDateTime = new Date(`${endDate}T${endTime || "23:59"}`);

        const taskData = {
          title,
          startDate: startDateTime,
          endDate: endDateTime,
          category,
          type: taskType,
          isDone,
          aiScheduleLocked,
        };

        // If task has null priority, set it to "plan" priority
        if (task && (task.priority === null || task.priority === undefined)) {
          taskData.priority = "plan";
        }

        if (task) {
          await updateTask(task.id, taskData);
        }

        // Check if we need to update null priority tasks for this user
        if (userData?.uid) {
          try {
            await updateNullPriorityTasks(userData.uid);
          } catch (updateError) {
            console.error(
              "Error updating null priority tasks after task update:",
              updateError
            );
          }
        }
      }

      onClose();
    } catch (err) {
      setHasError(err.message || "Failed to update event");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    hasError,
    handleSubmit,
  };
};
