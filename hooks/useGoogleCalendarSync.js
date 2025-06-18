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
      if (!hasAccess) return false;

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

        // Convert task/event data to Google Calendar format
        const googleEventData = {
          title: eventData.title || eventData.text,
          description: eventData.description || `Task: ${eventData.text}`,
          startTime: eventData.startTime || eventData.scheduledStart,
          endTime: eventData.endTime || eventData.scheduledEnd,
          timeZone:
            eventData.timeZone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          location: eventData.location,
        };

        // Sync to Google Calendar
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

        const result = await response.json();

        if (response.ok) {
          return {
            success: true,
            googleEventId: result.googleEventId,
            googleEvent: result.googleEvent,
          };
        } else {
          console.error("Failed to sync to Google Calendar:", result.error);
          return { success: false, error: result.error };
        }
      } catch (error) {
        console.error("Error syncing to Google Calendar:", error);
        return { success: false, error: "Failed to sync event" };
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

        const googleEventData = {
          title: eventData.title || eventData.text,
          description: eventData.description || `Task: ${eventData.text}`,
          startTime: eventData.startTime || eventData.scheduledStart,
          endTime: eventData.endTime || eventData.scheduledEnd,
          timeZone:
            eventData.timeZone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          location: eventData.location,
        };

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

        const result = await response.json();

        if (response.ok) {
          return { success: true, googleEvent: result.googleEvent };
        } else {
          console.error(
            "Failed to update Google Calendar event:",
            result.error
          );
          return { success: false, error: result.error };
        }
      } catch (error) {
        console.error("Error updating Google Calendar event:", error);
        return { success: false, error: "Failed to update event" };
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

        const response = await fetch(
          `/api/calendar/google/sync?userId=${user.uid}&googleEventId=${googleEventId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          return { success: true };
        } else {
          const result = await response.json();
          console.error(
            "Failed to delete Google Calendar event:",
            result.error
          );
          return { success: false, error: result.error };
        }
      } catch (error) {
        console.error("Error deleting Google Calendar event:", error);
        return { success: false, error: "Failed to delete event" };
      } finally {
        setIsSyncing(false);
      }
    },
    [user?.uid, checkGoogleCalendarAccess]
  );

  return {
    isSyncing,
    checkGoogleCalendarAccess,
    syncEventToGoogleCalendar,
    updateGoogleCalendarEvent,
    deleteGoogleCalendarEvent,
  };
};
