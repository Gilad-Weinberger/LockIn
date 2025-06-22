import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectGoogleCalendar } from "@/lib/functions/googleCalendarFunctions";
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

    // Get tokens from secure cookie
    const cookieStore = await cookies();
    const tokensCookie = cookieStore.get("google_calendar_tokens");

    if (!tokensCookie) {
      return NextResponse.json(
        {
          error:
            "No Google Calendar tokens found. Please retry the connection.",
        },
        { status: 400 }
      );
    }

    const connectionData = JSON.parse(tokensCookie.value);

    // Prepare tokens and calendar info for database storage
    const tokens = {
      access_token: connectionData.accessToken,
      refresh_token: connectionData.refreshToken,
      expiry_date: connectionData.expiryDate,
    };

    const calendarInfo = {
      summary: connectionData.calendarName,
    };

    // Save to database
    const result = await connectGoogleCalendar(userId, tokens, calendarInfo);

    if (result.success) {
      // Clear the cookie after successful connection
      cookieStore.delete("google_calendar_tokens");

      return NextResponse.json({
        success: true,
        message: "Google Calendar connected successfully!",
      });
    } else {
      return NextResponse.json(
        { error: "Failed to save Google Calendar connection" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error connecting Google Calendar:", error);
    return NextResponse.json(
      { error: "Failed to connect Google Calendar" },
      { status: 500 }
    );
  }
}
