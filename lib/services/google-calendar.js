import { google } from "googleapis";

class GoogleCalendarService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      process.env.NODE_ENV === "production"
        ? process.env.GOOGLE_OAUTH_REDIRECT_URI2
        : process.env.GOOGLE_OAUTH_REDIRECT_URI1
    );

    this.calendar = google.calendar({ version: "v3", auth: this.oauth2Client });
  }

  // Generate OAuth2 authorization URL
  getAuthUrl() {
    const scopes = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
    });
  }

  // Exchange authorization code for tokens
  async getTokens(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  // Set credentials for authenticated requests
  setCredentials(tokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials;
  }

  // Create calendar event
  async createEvent(eventData) {
    try {
      const event = {
        summary: eventData.title,
        description: eventData.description || "",
        start: {
          dateTime: eventData.startTime,
          timeZone: eventData.timeZone || "UTC",
        },
        end: {
          dateTime: eventData.endTime,
          timeZone: eventData.timeZone || "UTC",
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 10 },
          ],
        },
      };

      if (eventData.location) {
        event.location = eventData.location;
      }

      const response = await this.calendar.events.insert({
        calendarId: "primary",
        resource: event,
      });

      return response.data;
    } catch (error) {
      console.error("Error creating Google Calendar event:", error);
      throw error;
    }
  }

  // Update calendar event
  async updateEvent(eventId, eventData) {
    try {
      const event = {
        summary: eventData.summary || eventData.title,
        description: eventData.description || "",
      };

      // Handle start time - support both formats
      if (eventData.start) {
        event.start = eventData.start;
      } else if (eventData.startTime) {
        event.start = {
          dateTime: eventData.startTime,
          timeZone: eventData.timeZone || "UTC",
        };
      }

      // Handle end time - support both formats
      if (eventData.end) {
        event.end = eventData.end;
      } else if (eventData.endTime) {
        event.end = {
          dateTime: eventData.endTime,
          timeZone: eventData.timeZone || "UTC",
        };
      }

      if (eventData.location) {
        event.location = eventData.location;
      }

      const response = await this.calendar.events.update({
        calendarId: "primary",
        eventId: eventId,
        resource: event,
      });

      return response.data;
    } catch (error) {
      console.error("Error updating Google Calendar event:", error);
      throw error;
    }
  }

  // Delete calendar event
  async deleteEvent(eventId) {
    try {
      await this.calendar.events.delete({
        calendarId: "primary",
        eventId: eventId,
      });
      return true;
    } catch (error) {
      console.error("Error deleting Google Calendar event:", error);
      throw error;
    }
  }

  // Get calendar events
  async getEvents(timeMin, timeMax) {
    try {
      const response = await this.calendar.events.list({
        calendarId: "primary",
        timeMin: timeMin,
        timeMax: timeMax,
        singleEvents: true,
        orderBy: "startTime",
      });

      return response.data.items || [];
    } catch (error) {
      console.error("Error fetching Google Calendar events:", error);
      throw error;
    }
  }

  // Get user's calendar info
  async getCalendarInfo() {
    try {
      const response = await this.calendar.calendars.get({
        calendarId: "primary",
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching calendar info:", error);
      throw error;
    }
  }
}

export default GoogleCalendarService;
