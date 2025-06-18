import { NextResponse } from "next/server";
import GoogleCalendarService from "@/lib/services/google-calendar";
import { connectGoogleCalendar } from "@/lib/functions/googleCalendarFunctions";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

    if (error) {
      console.error("OAuth error:", error);
      return NextResponse.redirect(
        new URL("/settings?google_calendar_error=access_denied", request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/settings?google_calendar_error=no_code", request.url)
      );
    }

    const googleCalendarService = new GoogleCalendarService();

    // Exchange code for tokens
    const tokens = await googleCalendarService.getTokens(code);

    // Set credentials and get calendar info
    googleCalendarService.setCredentials(tokens);
    const calendarInfo = await googleCalendarService.getCalendarInfo();

    // Get current user from session/token
    // Since we're in an API route, we need to verify the user
    // For now, we'll redirect with the tokens and handle on client side
    const redirectUrl = new URL("/api/auth/google/complete", request.url);
    redirectUrl.searchParams.set("access_token", tokens.access_token);
    if (tokens.refresh_token) {
      redirectUrl.searchParams.set("refresh_token", tokens.refresh_token);
    }
    if (tokens.expiry_date) {
      redirectUrl.searchParams.set(
        "expiry_date",
        tokens.expiry_date.toString()
      );
    }
    redirectUrl.searchParams.set(
      "calendar_name",
      calendarInfo.summary || "Primary Calendar"
    );

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Error in Google OAuth callback:", error);
    return NextResponse.redirect(
      new URL("/settings?google_calendar_error=connection_failed", request.url)
    );
  }
}
