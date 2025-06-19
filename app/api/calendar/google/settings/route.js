import { NextResponse } from "next/server";
import { canAccessFeature } from "@/lib/utils/subscription-utils";
import {
  updateGoogleCalendarSettings,
  getGoogleCalendarSettings,
} from "@/lib/functions/googleCalendarFunctions";

// Calendar settings API route

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, autoSync, showGoogleEvents } = body;

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

    // Update user document with new settings
    const settings = {};

    if (typeof autoSync === "boolean") {
      settings.autoSync = autoSync;
    }

    if (typeof showGoogleEvents === "boolean") {
      settings.showGoogleEvents = showGoogleEvents;
    }

    if (Object.keys(settings).length === 0) {
      return NextResponse.json(
        { error: "No valid settings to update" },
        { status: 400 }
      );
    }

    const result = await updateGoogleCalendarSettings(userId, settings);

    if (!result.success) {
      throw new Error("Failed to update settings");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating calendar settings:", error);
    return NextResponse.json(
      { error: "Failed to update calendar settings" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user calendar settings
    const settings = await getGoogleCalendarSettings(userId);

    // Always return the settings (even for free users)
    // The subscription check should be done client-side before making API calls
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching calendar settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar settings" },
      { status: 500 }
    );
  }
}
