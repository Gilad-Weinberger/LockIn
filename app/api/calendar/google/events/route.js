import { NextResponse } from "next/server";
import GoogleCalendarService from "@/lib/services/google-calendar";
import {
  getUserGoogleCalendarData,
  updateGoogleCalendarTokens,
  getGoogleCalendarSettings,
} from "@/lib/functions/googleCalendarFunctions";
import { canAccessFeature } from "@/lib/utils/subscription-utils";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const timeMin = searchParams.get("timeMin");
    const timeMax = searchParams.get("timeMax");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
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

    // Get user's Google Calendar settings
    const userSettings = await getGoogleCalendarSettings(userId);

    // Check if user wants to show Google Calendar events
    if (!userSettings.showGoogleEvents) {
      return NextResponse.json({ events: [] }, { status: 200 });
    }

    // Get user's Google Calendar data
    const googleCalendarData = await getUserGoogleCalendarData(userId);

    if (!googleCalendarData.connected) {
      return NextResponse.json({ events: [] }, { status: 200 });
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

    // Set default time range if not provided (current month)
    const defaultTimeMin =
      timeMin ||
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).toISOString();
    const defaultTimeMax =
      timeMax ||
      new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0,
        23,
        59,
        59
      ).toISOString();

    // Fetch events from Google Calendar
    const events = await googleCalendarService.getEvents(
      defaultTimeMin,
      defaultTimeMax
    );

    // Transform events to a consistent format
    const transformedEvents = events.map((event) => ({
      id: event.id,
      title: event.summary || "Untitled Event",
      description: event.description || "",
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      allDay: !event.start?.dateTime, // If no time, it's an all-day event
      location: event.location || "",
      source: "google_calendar",
      htmlLink: event.htmlLink,
      status: event.status,
      creator: event.creator,
      organizer: event.organizer,
    }));

    return NextResponse.json({
      events: transformedEvents,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching Google Calendar events:", error);
    return NextResponse.json(
      { error: "Failed to fetch Google Calendar events" },
      { status: 500 }
    );
  }
}
