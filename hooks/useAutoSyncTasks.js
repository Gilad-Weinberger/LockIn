import { useEffect, useState } from "react";
import { useGoogleCalendarSync } from "./useGoogleCalendarSync";
import { canAccessFeature } from "@/lib/utils/subscription-utils";
import { storeGoogleCalendarEventMapping } from "@/lib/functions/taskFunctions";

/**
 * Hook to automatically sync future scheduled tasks to Google Calendar
 * @param {Array} tasks - All tasks
 * @param {Object} user - Current user
 * @param {boolean} isLoading - Whether tasks are loading
 * @returns {Object} Sync status and functions
 */
export const useAutoSyncTasks = (tasks, user, isLoading) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedTaskIds, setSyncedTaskIds] = useState([]);
  const { syncEventToGoogleCalendar, checkGoogleCalendarAccess } =
    useGoogleCalendarSync();

  useEffect(() => {
    const syncFutureTasks = async () => {
      if (!user?.uid || isLoading || !tasks.length) {
        console.log("🚫 Sync prerequisites not met:", {
          hasUser: !!user?.uid,
          isLoading,
          tasksCount: tasks.length,
        });
        return;
      }

      // Check if Google Calendar sync is available
      const canSync = await checkGoogleCalendarAccess();

      if (!canSync) {
        console.log(
          "🚫 Google Calendar sync not available - checking reasons..."
        );

        // Additional debugging to see why sync is not available
        try {
          const settingsResponse = await fetch(
            `/api/calendar/google/settings?userId=${user.uid}`
          );
          const settings = await settingsResponse.json();

          const hasAccess = await canAccessFeature(user.uid, "google_calendar");

          console.log("❌ Sync blocked because:");
          if (!hasAccess)
            console.log("   - No Pro subscription / feature access");
          if (!settings.connected)
            console.log("   - Google Calendar not connected");
          if (!settings.autoSync) console.log("   - Auto-sync is disabled");
        } catch (error) {
          console.error("Error during debug check:", error);
        }

        return;
      }

      // Filter for future scheduled tasks that aren't synced yet
      const now = new Date();
      const futureTasks = tasks.filter((task) => {
        // Must be scheduled (have startDate and endDate)
        if (!task.startDate || !task.endDate) return false;

        // Must be in the future
        const taskEndDate = task.endDate.toDate
          ? task.endDate.toDate()
          : new Date(task.endDate);
        if (taskEndDate <= now) return false;

        // Must not be done
        if (task.isDone) return false;

        // Must not already be synced to Google Calendar
        if (task.googleCalendarSynced) {
          return false;
        }

        return true;
      });

      if (futureTasks.length === 0) {
        return;
      }

      setIsSyncing(true);
      const successfulSyncs = [];
      const failedSyncs = [];

      // Sync each task
      for (const task of futureTasks) {
        try {
          const eventData = {
            title: task.title || task.text,
            description: `Task: ${task.title || task.text}${
              task.scheduling_reasoning
                ? `\n\nScheduling: ${task.scheduling_reasoning}`
                : ""
            }`,
            startTime: task.startDate.toDate
              ? task.startDate.toDate()
              : new Date(task.startDate),
            endTime: task.endDate.toDate
              ? task.endDate.toDate()
              : new Date(task.endDate),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          };

          const result = await syncEventToGoogleCalendar(eventData, task.id);

          if (result.success) {
            // Store the mapping in the task document (client-side)
            try {
              await storeGoogleCalendarEventMapping(
                task.id,
                result.googleEventId
              );
            } catch (mappingError) {
              console.error(
                `   ⚠️ Failed to store mapping for task ${task.id}:`,
                mappingError
              );
            }

            successfulSyncs.push({
              taskId: task.id,
              title: task.title || task.text,
              googleEventId: result.googleEventId,
              startTime: eventData.startTime,
              endTime: eventData.endTime,
            });
          } else {
            console.error(
              `❌ Failed to sync task "${task.title || task.text}" (ID: ${
                task.id
              }):`,
              result.error
            );
            failedSyncs.push({
              taskId: task.id,
              title: task.title || task.text,
              error: result.error,
            });
          }
        } catch (error) {
          console.error(
            `❌ Error syncing task "${task.title || task.text}" (ID: ${
              task.id
            }):`,
            error
          );
          failedSyncs.push({
            taskId: task.id,
            title: task.title || task.text,
            error: error.message,
          });
        }
      }

      // Update synced task IDs state if we have successful syncs
      if (successfulSyncs.length > 0) {
        setSyncedTaskIds(successfulSyncs.map((sync) => sync.taskId));

        // Clear the synced task IDs after 5 seconds
        setTimeout(() => {
          setSyncedTaskIds([]);
        }, 5000);
      }

      setIsSyncing(false);
    };

    // Debounce the sync to avoid too many calls
    const timeoutId = setTimeout(syncFutureTasks, 2000);
    return () => clearTimeout(timeoutId);
  }, [
    tasks,
    user?.uid,
    isLoading,
    checkGoogleCalendarAccess,
    syncEventToGoogleCalendar,
  ]);

  return {
    isSyncing,
    syncedTaskIds,
  };
};
