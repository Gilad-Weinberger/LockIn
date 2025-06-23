import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { canAccessFeature } from "@/lib/utils/subscription-utils";

export const useGoogleCalendarSync = () => {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  const checkGoogleCalendarAccess = useCallback(async () => {
    if (!user?.uid) return false;

    try {
      const hasAccess = await canAccessFeature(user.uid, "google_calendar");
      if (!hasAccess) {
        // Don't log as error since this is expected for free users
        return false;
      }

      // Check if user has Google Calendar connected and auto-sync enabled
      const response = await fetch(
        `/api/calendar/google/settings?userId=${user.uid}`
      );
      if (!response.ok) return false;

      const settings = await response.json();
      return settings.connected && settings.autoSync;
    } catch (error) {
      console.error("Error checking Google Calendar access:", error);
      return false;
    }
  }, [user?.uid]);

  const retryOperation = async (operation, maxRetries = 3, delayMs = 1000) => {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error.message);

        if (attempt < maxRetries) {
          // Exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, delayMs * attempt)
          );
        }
      }
    }

    throw lastError;
  };

  const syncEventToGoogleCalendar = useCallback(
    async (eventData, taskId = null) => {
      if (!user?.uid)
        return { success: false, error: "User not authenticated" };

      setIsSyncing(true);
      try {
        // Check if sync is enabled
        const canSync = await checkGoogleCalendarAccess();
        if (!canSync) {
          return {
            success: false,
            error: "Google Calendar sync not available",
          };
        }

        // Validate event data
        if (!eventData.title || !eventData.startTime || !eventData.endTime) {
          return {
            success: false,
            error: "Missing required event data (title, startTime, endTime)",
          };
        }

        // Convert dates to ISO strings if they're Date objects
        const startTime =
          eventData.startTime instanceof Date
            ? eventData.startTime.toISOString()
            : eventData.startTime;
        const endTime =
          eventData.endTime instanceof Date
            ? eventData.endTime.toISOString()
            : eventData.endTime;

        // Convert task/event data to Google Calendar format
        const googleEventData = {
          title: eventData.title || eventData.text,
          description:
            eventData.description ||
            `Task: ${eventData.title || eventData.text}`,
          startTime,
          endTime,
          timeZone:
            eventData.timeZone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          location: eventData.location,
        };

        // Sync to Google Calendar with retry logic
        const result = await retryOperation(async () => {
          const response = await fetch("/api/calendar/google/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.uid,
              eventData: googleEventData,
              taskId,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
          }

          return await response.json();
        });

        return {
          success: true,
          googleEventId: result.googleEventId,
          googleEvent: result.googleEvent,
        };
      } catch (error) {
        console.error("Error syncing to Google Calendar:", error);
        return {
          success: false,
          error: error.message || "Failed to sync event",
        };
      } finally {
        setIsSyncing(false);
      }
    },
    [user?.uid, checkGoogleCalendarAccess]
  );

  const updateGoogleCalendarEvent = useCallback(
    async (googleEventId, eventData) => {
      if (!user?.uid || !googleEventId)
        return { success: false, error: "Missing required data" };

      setIsSyncing(true);
      try {
        const canSync = await checkGoogleCalendarAccess();
        if (!canSync) {
          return {
            success: false,
            error: "Google Calendar sync not available",
          };
        }

        // Validate event data
        if (!eventData.title && !eventData.text) {
          return {
            success: false,
            error: "Missing event title",
          };
        }

        // Convert dates to ISO strings if they're Date objects
        const startTime =
          eventData.startTime instanceof Date
            ? eventData.startTime.toISOString()
            : eventData.startTime;
        const endTime =
          eventData.endTime instanceof Date
            ? eventData.endTime.toISOString()
            : eventData.endTime;

        const googleEventData = {
          title: eventData.title || eventData.text,
          description:
            eventData.description ||
            `Task: ${eventData.title || eventData.text}`,
          startTime: startTime || eventData.scheduledStart,
          endTime: endTime || eventData.scheduledEnd,
          timeZone:
            eventData.timeZone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          location: eventData.location,
        };

        const result = await retryOperation(async () => {
          const response = await fetch("/api/calendar/google/sync", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.uid,
              eventData: googleEventData,
              googleEventId,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
          }

          return await response.json();
        });

        return { success: true, googleEvent: result.googleEvent };
      } catch (error) {
        console.error("Error updating Google Calendar event:", error);
        return {
          success: false,
          error: error.message || "Failed to update event",
        };
      } finally {
        setIsSyncing(false);
      }
    },
    [user?.uid, checkGoogleCalendarAccess]
  );

  const deleteGoogleCalendarEvent = useCallback(
    async (googleEventId) => {
      if (!user?.uid || !googleEventId)
        return { success: false, error: "Missing required data" };

      setIsSyncing(true);
      try {
        const canSync = await checkGoogleCalendarAccess();
        if (!canSync) {
          return {
            success: false,
            error: "Google Calendar sync not available",
          };
        }

        await retryOperation(async () => {
          const response = await fetch(
            `/api/calendar/google/sync?userId=${user.uid}&googleEventId=${googleEventId}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
          }
        });

        return { success: true };
      } catch (error) {
        console.error("Error deleting Google Calendar event:", error);
        return {
          success: false,
          error: error.message || "Failed to delete event",
        };
      } finally {
        setIsSyncing(false);
      }
    },
    [user?.uid, checkGoogleCalendarAccess]
  );

  const bulkSyncTasks = useCallback(
    async (tasks) => {
      if (!user?.uid || !tasks.length) {
        return { success: false, error: "No tasks to sync" };
      }

      const canSync = await checkGoogleCalendarAccess();
      if (!canSync) {
        return {
          success: false,
          error: "Google Calendar sync not available",
        };
      }

      setIsSyncing(true);
      const results = { success: [], failed: [] };

      try {
        // Process tasks in batches to avoid overwhelming the API
        const batchSize = 5;
        for (let i = 0; i < tasks.length; i += batchSize) {
          const batch = tasks.slice(i, i + batchSize);
          const batchPromises = batch.map(async (task) => {
            try {
              const eventData = {
                title: task.title,
                startTime: task.startDate,
                endTime: task.endDate,
                description: `Task: ${task.title}`,
              };

              const result = await syncEventToGoogleCalendar(
                eventData,
                task.id
              );

              if (result.success) {
                results.success.push({ taskId: task.id, ...result });
              } else {
                results.failed.push({ taskId: task.id, error: result.error });
              }
            } catch (error) {
              results.failed.push({ taskId: task.id, error: error.message });
            }
          });

          await Promise.allSettled(batchPromises);

          // Small delay between batches to respect rate limits
          if (i + batchSize < tasks.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        return {
          success: true,
          summary: {
            total: tasks.length,
            synced: results.success.length,
            failed: results.failed.length,
          },
          details: results,
        };
      } catch (error) {
        console.error("Error in bulk sync:", error);
        return { success: false, error: error.message || "Bulk sync failed" };
      } finally {
        setIsSyncing(false);
      }
    },
    [user?.uid, checkGoogleCalendarAccess, syncEventToGoogleCalendar]
  );

  return {
    isSyncing,
    checkGoogleCalendarAccess,
    syncEventToGoogleCalendar,
    updateGoogleCalendarEvent,
    deleteGoogleCalendarEvent,
    bulkSyncTasks,
  };
};
