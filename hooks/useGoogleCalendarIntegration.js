import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

/**
 * Main Google Calendar Integration Hook
 * Handles both syncing tasks and displaying Google Calendar events
 */
export const useGoogleCalendarIntegration = (tasks = [], currentDate, view) => {
  const { user } = useAuth();

  // State management
  const [googleEvents, setGoogleEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    connected: false,
    autoSync: false,
    showGoogleEvents: false,
  });

  // Refs for preventing unnecessary re-renders
  const lastFetchRef = useRef(null);
  const lastSyncRef = useRef(null);

  // =====================================
  // SETTINGS MANAGEMENT
  // =====================================

  /**
   * Fetch user's Google Calendar settings
   */
  const fetchSettings = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const response = await fetch(
        `/api/calendar/google/settings?userId=${user.uid}`
      );
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        return data;
      }
    } catch (error) {
      console.error("Error fetching Google Calendar settings:", error);
    }
    return null;
  }, [user?.uid]);

  /**
   * Update Google Calendar settings
   */
  const updateSettings = useCallback(
    async (newSettings) => {
      if (!user?.uid) return false;

      try {
        const response = await fetch("/api/calendar/google/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.uid, ...newSettings }),
        });

        if (response.ok) {
          await fetchSettings(); // Refresh settings
          return true;
        }
      } catch (error) {
        console.error("Error updating Google Calendar settings:", error);
      }
      return false;
    },
    [user?.uid, fetchSettings]
  );

  // =====================================
  // GOOGLE CALENDAR EVENTS
  // =====================================

  /**
   * Calculate date range based on current view
   */
  const getDateRange = useCallback(() => {
    if (!currentDate) return null;

    let timeMin, timeMax;

    if (view === "week") {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      timeMin = startOfWeek.toISOString();
      timeMax = endOfWeek.toISOString();
    } else {
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      endOfMonth.setHours(23, 59, 59, 999);

      timeMin = startOfMonth.toISOString();
      timeMax = endOfMonth.toISOString();
    }

    return { timeMin, timeMax };
  }, [currentDate, view]);

  /**
   * Fetch Google Calendar events
   */
  const fetchGoogleEvents = useCallback(async () => {
    if (!user?.uid || !settings.connected || !settings.showGoogleEvents) {
      setGoogleEvents([]);
      return;
    }

    const dateRange = getDateRange();
    if (!dateRange) return;

    // Prevent duplicate requests
    const fetchKey = `${dateRange.timeMin}-${dateRange.timeMax}`;
    if (lastFetchRef.current === fetchKey) return;
    lastFetchRef.current = fetchKey;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/calendar/google/events?userId=${user.uid}&timeMin=${dateRange.timeMin}&timeMax=${dateRange.timeMax}`
      );

      if (response.ok) {
        const data = await response.json();
        setGoogleEvents(data.events || []);
      } else if (response.status === 401) {
        // Token expired - user needs to reconnect
        setSettings((prev) => ({ ...prev, connected: false }));
        setGoogleEvents([]);
      } else {
        throw new Error("Failed to fetch Google Calendar events");
      }
    } catch (err) {
      console.error("Error fetching Google Calendar events:", err);
      setError(err.message);
      setGoogleEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, settings.connected, settings.showGoogleEvents, getDateRange]);

  // =====================================
  // TASK SYNCING
  // =====================================

  /**
   * Check if a task should be synced to Google Calendar
   */
  const shouldSyncTask = useCallback(
    (task) => {
      if (!task || !settings.connected || !settings.autoSync) return false;

      // Must have scheduling information
      if (!task.startDate || !task.endDate) return false;

      // Must be in the future
      const now = new Date();
      const taskEndDate = task.endDate.toDate
        ? task.endDate.toDate()
        : new Date(task.endDate);
      if (taskEndDate <= now) return false;

      // Must not be completed
      if (task.isDone) return false;

      // Must not already be synced
      if (task.googleCalendarEventId) return false;

      return true;
    },
    [settings.connected, settings.autoSync]
  );

  /**
   * Get tasks that need to be synced
   */
  const getTasksToSync = useCallback(() => {
    return tasks.filter(shouldSyncTask);
  }, [tasks, shouldSyncTask]);

  /**
   * Sync a single task to Google Calendar
   */
  const syncTask = useCallback(
    async (task) => {
      if (!shouldSyncTask(task))
        return { success: false, error: "Task should not be synced" };

      try {
        const eventData = {
          title: task.title,
          description: task.description || `Task: ${task.title}`,
          startTime: task.startDate.toDate
            ? task.startDate.toDate().toISOString()
            : new Date(task.startDate).toISOString(),
          endTime: task.endDate.toDate
            ? task.endDate.toDate().toISOString()
            : new Date(task.endDate).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        const response = await fetch("/api/calendar/google/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.uid,
            eventData,
            taskId: task.id,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          return { success: true, googleEventId: result.googleEventId };
        } else {
          const error = await response.json();
          throw new Error(error.error || "Failed to sync task");
        }
      } catch (error) {
        console.error("Error syncing task:", error);
        return { success: false, error: error.message };
      }
    },
    [shouldSyncTask, user?.uid]
  );

  /**
   * Update a Google Calendar event
   */
  const updateGoogleEvent = useCallback(
    async (task) => {
      if (!task.googleCalendarEventId)
        return { success: false, error: "No Google Calendar event ID" };

      try {
        const eventData = {
          title: task.title,
          description: task.description || `Task: ${task.title}`,
          startTime: task.startDate.toDate
            ? task.startDate.toDate().toISOString()
            : new Date(task.startDate).toISOString(),
          endTime: task.endDate.toDate
            ? task.endDate.toDate().toISOString()
            : new Date(task.endDate).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        const response = await fetch("/api/calendar/google/sync", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.uid,
            eventData,
            googleEventId: task.googleCalendarEventId,
          }),
        });

        if (response.ok) {
          return { success: true };
        } else {
          const error = await response.json();
          throw new Error(error.error || "Failed to update event");
        }
      } catch (error) {
        console.error("Error updating Google Calendar event:", error);
        return { success: false, error: error.message };
      }
    },
    [user?.uid]
  );

  /**
   * Delete a Google Calendar event
   */
  const deleteGoogleEvent = useCallback(
    async (googleEventId) => {
      if (!googleEventId)
        return { success: false, error: "No Google Calendar event ID" };

      try {
        const response = await fetch(
          `/api/calendar/google/sync?userId=${user.uid}&googleEventId=${googleEventId}`,
          { method: "DELETE" }
        );

        if (response.ok) {
          return { success: true };
        } else {
          const error = await response.json();
          throw new Error(error.error || "Failed to delete event");
        }
      } catch (error) {
        console.error("Error deleting Google Calendar event:", error);
        return { success: false, error: error.message };
      }
    },
    [user?.uid]
  );

  /**
   * Bulk sync multiple tasks
   */
  const syncAllTasks = useCallback(async () => {
    const tasksToSync = getTasksToSync();
    if (tasksToSync.length === 0) return { success: true, synced: 0 };

    setIsSyncing(true);

    try {
      let synced = 0;
      const errors = [];

      for (const task of tasksToSync) {
        const result = await syncTask(task);
        if (result.success) {
          synced++;
        } else {
          errors.push({ taskId: task.id, error: result.error });
        }
      }

      return { success: true, synced, total: tasksToSync.length, errors };
    } catch (error) {
      console.error("Error syncing tasks:", error);
      return { success: false, error: error.message };
    } finally {
      setIsSyncing(false);
    }
  }, [getTasksToSync, syncTask]);

  // =====================================
  // AUTO-SYNC LOGIC
  // =====================================

  /**
   * Auto-sync tasks when they change
   */
  useEffect(() => {
    if (!settings.connected || !settings.autoSync) return;

    const tasksToSync = getTasksToSync();
    if (tasksToSync.length === 0) return;

    // Prevent too frequent syncs
    const now = Date.now();
    if (lastSyncRef.current && now - lastSyncRef.current < 60000) return; // 1 minute cooldown
    lastSyncRef.current = now;

    // Sync after a short delay to batch multiple changes
    const timer = setTimeout(() => {
      syncAllTasks();
    }, 3000);

    return () => clearTimeout(timer);
  }, [
    tasks,
    settings.connected,
    settings.autoSync,
    getTasksToSync,
    syncAllTasks,
  ]);

  // =====================================
  // INITIALIZATION
  // =====================================

  // Fetch settings on mount and user change
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Fetch Google events when settings or date range changes
  useEffect(() => {
    fetchGoogleEvents();
  }, [fetchGoogleEvents]);

  // =====================================
  // RETURN API
  // =====================================

  return {
    // Settings
    settings,
    updateSettings,
    refreshSettings: fetchSettings,

    // Google Calendar Events
    googleEvents,
    isLoading,
    error,
    refreshEvents: fetchGoogleEvents,

    // Task Syncing
    isSyncing,
    syncTask,
    syncAllTasks,
    updateGoogleEvent,
    deleteGoogleEvent,
    getTasksToSync,

    // Utility
    shouldSyncTask,
  };
};
