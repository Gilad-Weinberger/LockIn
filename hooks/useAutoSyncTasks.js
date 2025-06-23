import { useEffect, useState, useCallback } from "react";
import { useGoogleCalendarSync } from "./useGoogleCalendarSync";
import { canAccessFeature } from "@/lib/utils/subscription-utils";
import { updateTask } from "@/lib/functions/taskFunctions";

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
  const [lastSyncAttempt, setLastSyncAttempt] = useState(null);
  const [syncStats, setSyncStats] = useState({
    synced: 0,
    failed: 0,
    total: 0,
  });

  const {
    syncEventToGoogleCalendar,
    checkGoogleCalendarAccess,
    bulkSyncTasks,
  } = useGoogleCalendarSync();

  // Filter tasks that need syncing
  const getTasksToSync = useCallback((tasks) => {
    if (!tasks || !tasks.length) return [];

    const now = new Date();

    return tasks.filter((task) => {
      // Must be scheduled (have startDate and endDate)
      if (!task.startDate || !task.endDate) return false;

      // Must be in the future (at least the end date)
      const taskEndDate = task.endDate.toDate
        ? task.endDate.toDate()
        : new Date(task.endDate);
      if (taskEndDate <= now) return false;

      // Must not be completed/done
      if (task.isDone) return false;

      // Must not already be synced to Google Calendar
      if (task.googleCalendarSynced && task.googleCalendarEventId) return false;

      // Optional: Only sync tasks that are scheduled for today or later
      const taskStartDate = task.startDate.toDate
        ? task.startDate.toDate()
        : new Date(task.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return taskStartDate >= today;
    });
  }, []);

  // Manual sync function
  const manualSync = useCallback(
    async (taskList = null) => {
      if (!user?.uid) {
        console.log("🚫 No user authenticated for manual sync");
        return { success: false, error: "User not authenticated" };
      }

      const tasksToSync = taskList || getTasksToSync(tasks);
      if (tasksToSync.length === 0) {
        console.log("📋 No tasks to sync");
        return { success: true, message: "No tasks to sync" };
      }

      const canSync = await checkGoogleCalendarAccess();
      if (!canSync) {
        console.log("🚫 Google Calendar sync not available");
        return { success: false, error: "Google Calendar sync not available" };
      }

      setIsSyncing(true);
      setSyncStats({ synced: 0, failed: 0, total: tasksToSync.length });

      try {
        const result = await bulkSyncTasks(tasksToSync);

        if (result.success) {
          // Update sync stats
          setSyncStats({
            synced: result.summary.synced,
            failed: result.summary.failed,
            total: result.summary.total,
          });

          // Update synced task IDs for UI feedback
          const successfulSyncIds = result.details.success.map(
            (item) => item.taskId
          );
          setSyncedTaskIds(successfulSyncIds);

          // Clear the synced task IDs after 5 seconds
          setTimeout(() => {
            setSyncedTaskIds([]);
          }, 5000);

          console.log(
            `✅ Bulk sync completed: ${result.summary.synced}/${result.summary.total} tasks synced`
          );

          return {
            success: true,
            summary: result.summary,
            details: result.details,
          };
        } else {
          console.error("❌ Bulk sync failed:", result.error);
          return { success: false, error: result.error };
        }
      } catch (error) {
        console.error("❌ Manual sync error:", error);
        return { success: false, error: error.message || "Sync failed" };
      } finally {
        setIsSyncing(false);
        setLastSyncAttempt(new Date());
      }
    },
    [user?.uid, tasks, getTasksToSync, checkGoogleCalendarAccess, bulkSyncTasks]
  );

  // Individual task sync function
  const syncSingleTask = useCallback(
    async (task) => {
      if (!user?.uid || !task) {
        return { success: false, error: "Invalid parameters" };
      }

      const canSync = await checkGoogleCalendarAccess();
      if (!canSync) {
        return { success: false, error: "Google Calendar sync not available" };
      }

      try {
        const eventData = {
          title: task.title,
          description: `Task: ${task.title}${
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
          // Update task with Google Calendar event ID
          try {
            await updateTask(task.id, {
              googleCalendarSynced: true,
              googleCalendarEventId: result.googleEventId,
              lastSyncedAt: new Date(),
            });
          } catch (updateError) {
            console.error("Failed to update task after sync:", updateError);
          }

          return {
            success: true,
            googleEventId: result.googleEventId,
            taskId: task.id,
          };
        } else {
          return { success: false, error: result.error };
        }
      } catch (error) {
        console.error("Error syncing single task:", error);
        return {
          success: false,
          error: error.message || "Failed to sync task",
        };
      }
    },
    [user?.uid, checkGoogleCalendarAccess, syncEventToGoogleCalendar]
  );

  // Automatic sync effect
  useEffect(() => {
    const performAutoSync = async () => {
      if (!user?.uid || isLoading || !tasks.length) {
        return;
      }

      // Prevent too frequent auto-syncs (minimum 5 minutes between attempts)
      if (lastSyncAttempt && new Date() - lastSyncAttempt < 5 * 60 * 1000) {
        return;
      }

      const tasksToSync = getTasksToSync(tasks);
      if (tasksToSync.length === 0) {
        return;
      }

      // Check if sync is available
      const canSync = await checkGoogleCalendarAccess();
      if (!canSync) {
        return;
      }

      console.log(
        `🔄 Auto-syncing ${tasksToSync.length} tasks to Google Calendar...`
      );

      // Perform the sync
      await manualSync(tasksToSync);
    };

    // Debounce the auto-sync to avoid too many calls
    const timeoutId = setTimeout(performAutoSync, 3000);
    return () => clearTimeout(timeoutId);
  }, [
    tasks,
    user?.uid,
    isLoading,
    lastSyncAttempt,
    getTasksToSync,
    checkGoogleCalendarAccess,
    manualSync,
  ]);

  return {
    isSyncing,
    syncedTaskIds,
    syncStats,
    lastSyncAttempt,
    manualSync,
    syncSingleTask,
    getTasksToSync: () => getTasksToSync(tasks),
  };
};
