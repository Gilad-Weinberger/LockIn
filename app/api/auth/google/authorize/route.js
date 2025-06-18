import { NextResponse } from 'next/server';
import GoogleCalendarService from '@/lib/services/google-calendar';

export async function GET(request) {
  try {
    const googleCalendarService = new GoogleCalendarService();
    const authUrl = googleCalendarService.getAuthUrl();

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
} 