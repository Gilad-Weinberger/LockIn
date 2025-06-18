import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase";
import { disconnectGoogleCalendar } from "@/lib/functions/googleCalendarFunctions";
import { canAccessFeature } from "@/lib/utils/subscription-utils";

export async function POST(request) {
  try {
    const { userId } = await request.json();

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

    // Disconnect Google Calendar
    const result = await disconnectGoogleCalendar(userId);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to disconnect Google Calendar" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error disconnecting Google Calendar:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
