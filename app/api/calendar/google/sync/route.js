import { NextResponse } from "next/server";
import GoogleCalendarService from "@/lib/services/google-calendar";
import {
  getUserGoogleCalendarData,
  updateGoogleCalendarTokens,
} from "@/lib/functions/googleCalendarFunctions";
import { updateTask } from "@/lib/functions/taskFunctions";
import { canAccessFeature } from "@/lib/utils/subscription-utils";

export async function POST(request) {
  try {
    const { userId, eventData, taskId } = await request.json();

    if (!userId || !eventData) {
      return NextResponse.json(
        { error: "User ID and event data are required" },
        { status: 400 }
      );
    }

    // Check if user has pro access for Google Calendar features
    const canUseGoogleCalendar = await canAccessFeature(
      userId,
      "google_calendar"
    );

    if (!canUseGoogleCalendar) {
      return NextResponse.json(
        { error: "Pro subscription required for Google Calendar features" },
        { status: 403 }
      );
    }

    // Get user's Google Calendar data
    const googleCalendarData = await getUserGoogleCalendarData(userId);

    if (!googleCalendarData.connected) {
      return NextResponse.json(
        { error: "Google Calendar not connected" },
        { status: 400 }
      );
    }

    // Check if tokens need refresh
    const now = new Date().getTime();
    if (googleCalendarData.expiryDate && now >= googleCalendarData.expiryDate) {
      // Token expired, try to refresh
      if (!googleCalendarData.refreshToken) {
        return NextResponse.json(
          { error: "Access token expired and no refresh token available" },
          { status: 401 }
        );
      }

      try {
        const googleCalendarService = new GoogleCalendarService();
        const newTokens = await googleCalendarService.refreshToken(
          googleCalendarData.refreshToken
        );

        // Update tokens in database
        await updateGoogleCalendarTokens(userId, newTokens);

        // Use new tokens
        googleCalendarData.accessToken = newTokens.access_token;
        googleCalendarData.expiryDate = newTokens.expiry_date;
      } catch (refreshError) {
        console.error("Failed to refresh tokens:", refreshError);
        return NextResponse.json(
          { error: "Failed to refresh access token" },
          { status: 401 }
        );
      }
    }

    // Create Google Calendar service and set credentials
    const googleCalendarService = new GoogleCalendarService();
    googleCalendarService.setCredentials({
      access_token: googleCalendarData.accessToken,
      refresh_token: googleCalendarData.refreshToken,
      expiry_date: googleCalendarData.expiryDate,
    });

    // Create event in Google Calendar
    const googleEvent = await googleCalendarService.createEvent(eventData);

    // Return the google event info so client can store the mapping
    return NextResponse.json({
      success: true,
      googleEventId: googleEvent.id,
      googleEvent: googleEvent,
      taskId: taskId, // Include taskId in response for client-side mapping
    });
  } catch (error) {
    console.error("Error syncing to Google Calendar:", error);
    return NextResponse.json(
      { error: "Failed to sync event to Google Calendar" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const {
      userId,
      eventData,
      googleEventId,
      taskId,
      updateTask: shouldUpdateTask,
    } = await request.json();

    if (!userId || !eventData || !googleEventId) {
      return NextResponse.json(
        { error: "User ID, event data, and Google event ID are required" },
        { status: 400 }
      );
    }

    // Check if user has pro access for Google Calendar features
    const canUseGoogleCalendar = await canAccessFeature(
      userId,
      "google_calendar"
    );

    if (!canUseGoogleCalendar) {
      return NextResponse.json(
        { error: "Pro subscription required for Google Calendar features" },
        { status: 403 }
      );
    }

    // Get user's Google Calendar data
    const googleCalendarData = await getUserGoogleCalendarData(userId);

    if (!googleCalendarData.connected) {
      return NextResponse.json(
        { error: "Google Calendar not connected" },
        { status: 400 }
      );
    }

    // Check if tokens need refresh
    const now = new Date().getTime();
    if (googleCalendarData.expiryDate && now >= googleCalendarData.expiryDate) {
      // Token expired, try to refresh
      if (!googleCalendarData.refreshToken) {
        return NextResponse.json(
          { error: "Access token expired and no refresh token available" },
          { status: 401 }
        );
      }

      try {
        const googleCalendarService = new GoogleCalendarService();
        const newTokens = await googleCalendarService.refreshToken(
          googleCalendarData.refreshToken
        );

        // Update tokens in database
        await updateGoogleCalendarTokens(userId, newTokens);

        // Use new tokens
        googleCalendarData.accessToken = newTokens.access_token;
        googleCalendarData.expiryDate = newTokens.expiry_date;
      } catch (refreshError) {
        console.error("Failed to refresh tokens:", refreshError);
        return NextResponse.json(
          { error: "Failed to refresh access token" },
          { status: 401 }
        );
      }
    }

    // Create Google Calendar service and set credentials
    const googleCalendarService = new GoogleCalendarService();
    googleCalendarService.setCredentials({
      access_token: googleCalendarData.accessToken,
      refresh_token: googleCalendarData.refreshToken,
      expiry_date: googleCalendarData.expiryDate,
    });

    // Update event in Google Calendar
    const googleEvent = await googleCalendarService.updateEvent(
      googleEventId,
      eventData
    );

    // Update the corresponding task if requested and taskId is provided
    if (shouldUpdateTask && taskId) {
      try {
        const taskUpdates = {};

        // Update task title if the event summary changed
        if (eventData.summary) {
          taskUpdates.title = eventData.summary;
        }

        // Update start and end dates if they changed
        if (eventData.start) {
          if (eventData.start.dateTime) {
            taskUpdates.startDate = new Date(eventData.start.dateTime);
          } else if (eventData.start.date) {
            // For all-day events
            taskUpdates.startDate = new Date(eventData.start.date);
          }
        }

        if (eventData.end) {
          if (eventData.end.dateTime) {
            taskUpdates.endDate = new Date(eventData.end.dateTime);
          } else if (eventData.end.date) {
            // For all-day events
            taskUpdates.endDate = new Date(eventData.end.date);
          }
        }

        // Update task date for compatibility with existing task structure
        if (taskUpdates.startDate) {
          taskUpdates.taskDate = taskUpdates.startDate.toISOString();
        }

        // Only update if there are actual changes
        if (Object.keys(taskUpdates).length > 0) {
          await updateTask(taskId, taskUpdates);
          console.log(
            `Task ${taskId} updated with calendar changes:`,
            taskUpdates
          );
        }
      } catch (taskUpdateError) {
        console.error(
          "Error updating task after calendar sync:",
          taskUpdateError
        );
        // Don't fail the entire operation if task update fails
      }
    }

    return NextResponse.json({
      success: true,
      googleEvent: googleEvent,
      taskUpdated: shouldUpdateTask && taskId ? true : false,
    });
  } catch (error) {
    console.error("Error updating Google Calendar event:", error);
    return NextResponse.json(
      { error: "Failed to update Google Calendar event" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const googleEventId = searchParams.get("googleEventId");

    if (!userId || !googleEventId) {
      return NextResponse.json(
        { error: "User ID and Google event ID are required" },
        { status: 400 }
      );
    }

    // Check if user has pro access for Google Calendar features
    const canUseGoogleCalendar = await canAccessFeature(
      userId,
      "google_calendar"
    );

    if (!canUseGoogleCalendar) {
      return NextResponse.json(
        { error: "Pro subscription required for Google Calendar features" },
        { status: 403 }
      );
    }

    // Get user's Google Calendar data
    const googleCalendarData = await getUserGoogleCalendarData(userId);

    if (!googleCalendarData.connected) {
      return NextResponse.json(
        { error: "Google Calendar not connected" },
        { status: 400 }
      );
    }

    // Create Google Calendar service and set credentials
    const googleCalendarService = new GoogleCalendarService();
    googleCalendarService.setCredentials({
      access_token: googleCalendarData.accessToken,
      refresh_token: googleCalendarData.refreshToken,
      expiry_date: googleCalendarData.expiryDate,
    });

    // Delete event from Google Calendar
    await googleCalendarService.deleteEvent(googleEventId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting Google Calendar event:", error);
    return NextResponse.json(
      { error: "Failed to delete Google Calendar event" },
      { status: 500 }
    );
  }
}
