import { NextResponse } from 'next/server';
import { connectGoogleCalendar } from '@/lib/functions/googleCalendarFunctions';
import { canAccessFeature } from '@/lib/utils/subscription-utils';

export async function POST(request) {
  try {
    const { userId, tokens, calendarInfo } = await request.json();

    if (!userId || !tokens) {
      return NextResponse.json(
        { error: 'User ID and tokens are required' },
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

    // Connect Google Calendar
    const result = await connectGoogleCalendar(userId, tokens, calendarInfo);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to connect Google Calendar' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error connecting Google Calendar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 