import { NextResponse } from "next/server";
import { canAccessFeature } from "@/lib/utils/subscription-utils";
import { getUserData } from "@/lib/functions/userFunctions";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
    const updateData = {};

    if (typeof autoSync === "boolean") {
      updateData["googleCalendar.autoSync"] = autoSync;
    }

    if (typeof showGoogleEvents === "boolean") {
      updateData["googleCalendar.showGoogleEvents"] = showGoogleEvents;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid settings to update" },
        { status: 400 }
      );
    }

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updateData);

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

    // Get user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const googleCalendar = userData.googleCalendar || {};

    // Always return the settings (even for free users)
    // The subscription check should be done client-side before making API calls
    return NextResponse.json({
      connected: googleCalendar.connected || false,
      autoSync: googleCalendar.autoSync || false,
      showGoogleEvents: googleCalendar.showGoogleEvents !== false, // Default to true
      calendarName: googleCalendar.calendarName || "",
      connectedAt: googleCalendar.connectedAt || null,
    });
  } catch (error) {
    console.error("Error fetching calendar settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar settings" },
      { status: 500 }
    );
  }
}
