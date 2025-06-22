import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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

    // Store tokens in secure HTTP-only cookies temporarily (10 minutes)
    const cookieStore = await cookies();
    const connectionData = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      expiryDate: tokens.expiry_date || null,
      calendarName: calendarInfo?.summary || "Primary Calendar",
    };

    // Set secure HTTP-only cookie that expires in 10 minutes
    cookieStore.set("google_calendar_tokens", JSON.stringify(connectionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });

    // Redirect to calendar page with success flag
    return NextResponse.redirect(
      new URL("/calendar?google_calendar_success=true", request.url)
    );
  } catch (error) {
    console.error("Error in Google OAuth callback:", error);
    return NextResponse.redirect(
      new URL("/settings?google_calendar_error=connection_failed", request.url)
    );
  }
}
