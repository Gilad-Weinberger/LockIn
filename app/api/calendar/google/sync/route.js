import { NextResponse } from "next/server";
import GoogleCalendarService from "@/lib/services/google-calendar";
import {
  getUserGoogleCalendarData,
  updateGoogleCalendarTokens,
} from "@/lib/functions/googleCalendarFunctions";
import { updateTask } from "@/lib/functions/taskFunctions";
import { canAccessFeature } from "@/lib/utils/subscription-utils";

// Helper function to refresh tokens if needed
const ensureValidTokens = async (userId, googleCalendarData) => {
  const now = new Date().getTime();

  if (googleCalendarData.expiryDate && now >= googleCalendarData.expiryDate) {
    if (!googleCalendarData.refreshToken) {
      throw new Error("Access token expired and no refresh token available");
    }

    try {
      const googleCalendarService = new GoogleCalendarService();
      const newTokens = await googleCalendarService.refreshToken(
        googleCalendarData.refreshToken
      );

      await updateGoogleCalendarTokens(userId, newTokens);

      return {
        ...googleCalendarData,
        accessToken: newTokens.access_token,
        expiryDate: newTokens.expiry_date,
      };
    } catch (refreshError) {
      console.error("Failed to refresh tokens:", refreshError);
      throw new Error("Failed to refresh access token");
    }
  }

  return googleCalendarData;
};

// Helper function to validate user access and get calendar data
const validateUserAndGetCalendarData = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const canUseGoogleCalendar = await canAccessFeature(
    userId,
    "google_calendar"
  );
  if (!canUseGoogleCalendar) {
    throw new Error("Pro subscription required for Google Calendar features");
  }

  const googleCalendarData = await getUserGoogleCalendarData(userId);
  if (!googleCalendarData.connected) {
    throw new Error("Google Calendar not connected");
  }

  return await ensureValidTokens(userId, googleCalendarData);
};

// Helper function to create and configure Google Calendar service
const createGoogleCalendarService = (googleCalendarData) => {
  const googleCalendarService = new GoogleCalendarService();
  googleCalendarService.setCredentials({
    access_token: googleCalendarData.accessToken,
    refresh_token: googleCalendarData.refreshToken,
    expiry_date: googleCalendarData.expiryDate,
  });
  return googleCalendarService;
};

export async function POST(request) {
  try {
    const { userId, eventData, taskId } = await request.json();

    if (!eventData) {
      return NextResponse.json(
        { error: "Event data is required" },
        { status: 400 }
      );
    }

    // Validate event data
    if (!eventData.title || !eventData.startTime || !eventData.endTime) {
      return NextResponse.json(
        { error: "Event data must include title, startTime, and endTime" },
        { status: 400 }
      );
    }

    const googleCalendarData = await validateUserAndGetCalendarData(userId);
    const googleCalendarService =
      createGoogleCalendarService(googleCalendarData);

    // Create event in Google Calendar
    const googleEvent = await googleCalendarService.createEvent(eventData);

    // Update task with Google Calendar mapping if taskId provided
    if (taskId) {
      try {
        await updateTask(taskId, {
          googleCalendarSynced: true,
          googleCalendarEventId: googleEvent.id,
          lastSyncedAt: new Date(),
        });
      } catch (taskUpdateError) {
        console.error(
          "Failed to update task with Google Calendar mapping:",
          taskUpdateError
        );
        // Don't fail the entire operation if task update fails
      }
    }

    return NextResponse.json({
      success: true,
      googleEventId: googleEvent.id,
      googleEvent: googleEvent,
      taskId: taskId,
    });
  } catch (error) {
    console.error("Error creating Google Calendar event:", error);

    // Return appropriate error status based on error type
    const status = error.message.includes("subscription required")
      ? 403
      : error.message.includes("not connected")
      ? 400
      : error.message.includes("not authenticated")
      ? 401
      : 500;

    return NextResponse.json(
      { error: error.message || "Failed to create Google Calendar event" },
      { status }
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
      updateTask: shouldUpdateTask = false,
    } = await request.json();

    if (!eventData || !googleEventId) {
      return NextResponse.json(
        { error: "Event data and Google event ID are required" },
        { status: 400 }
      );
    }

    const googleCalendarData = await validateUserAndGetCalendarData(userId);
    const googleCalendarService =
      createGoogleCalendarService(googleCalendarData);

    // Update event in Google Calendar
    const googleEvent = await googleCalendarService.updateEvent(
      googleEventId,
      eventData
    );

    // Update the corresponding task if requested and taskId is provided
    if (shouldUpdateTask && taskId) {
      try {
        const taskUpdates = {
          lastSyncedAt: new Date(),
        };

        // Update task title if the event summary changed
        if (eventData.summary || eventData.title) {
          taskUpdates.title = eventData.summary || eventData.title;
        }

        // Update start and end dates if they changed
        if (eventData.start) {
          if (eventData.start.dateTime) {
            taskUpdates.startDate = new Date(eventData.start.dateTime);
          } else if (eventData.start.date) {
            taskUpdates.startDate = new Date(eventData.start.date);
          }
        } else if (eventData.startTime) {
          taskUpdates.startDate = new Date(eventData.startTime);
        }

        if (eventData.end) {
          if (eventData.end.dateTime) {
            taskUpdates.endDate = new Date(eventData.end.dateTime);
          } else if (eventData.end.date) {
            taskUpdates.endDate = new Date(eventData.end.date);
          }
        } else if (eventData.endTime) {
          taskUpdates.endDate = new Date(eventData.endTime);
        }

        // Update task date for compatibility with existing task structure
        if (taskUpdates.startDate) {
          taskUpdates.taskDate = taskUpdates.startDate.toISOString();
        }

        // Only update if there are actual changes
        if (Object.keys(taskUpdates).length > 1) {
          // More than just lastSyncedAt
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

    const status = error.message.includes("subscription required")
      ? 403
      : error.message.includes("not connected")
      ? 400
      : error.message.includes("not authenticated")
      ? 401
      : 500;

    return NextResponse.json(
      { error: error.message || "Failed to update Google Calendar event" },
      { status }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const googleEventId = searchParams.get("googleEventId");
    const taskId = searchParams.get("taskId");

    if (!googleEventId) {
      return NextResponse.json(
        { error: "Google event ID is required" },
        { status: 400 }
      );
    }

    const googleCalendarData = await validateUserAndGetCalendarData(userId);
    const googleCalendarService =
      createGoogleCalendarService(googleCalendarData);

    // Delete event from Google Calendar
    await googleCalendarService.deleteEvent(googleEventId);

    // Update task to remove Google Calendar mapping if taskId provided
    if (taskId) {
      try {
        await updateTask(taskId, {
          googleCalendarSynced: false,
          googleCalendarEventId: null,
          lastSyncedAt: new Date(),
        });
      } catch (taskUpdateError) {
        console.error(
          "Failed to update task after Google Calendar deletion:",
          taskUpdateError
        );
        // Don't fail the entire operation if task update fails
      }
    }

    return NextResponse.json({
      success: true,
      deletedEventId: googleEventId,
      taskUpdated: taskId ? true : false,
    });
  } catch (error) {
    console.error("Error deleting Google Calendar event:", error);

    const status = error.message.includes("subscription required")
      ? 403
      : error.message.includes("not connected")
      ? 400
      : error.message.includes("not authenticated")
      ? 401
      : 500;

    return NextResponse.json(
      { error: error.message || "Failed to delete Google Calendar event" },
      { status }
    );
  }
}
