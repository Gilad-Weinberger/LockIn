import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { connectGoogleCalendar } from '@/lib/functions/googleCalendarFunctions';

export const useGoogleCalendarConnection = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Handle connection completion from OAuth flow
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get("google_calendar_success") === "true") {
      const connectionData = sessionStorage.getItem("google_calendar_connection");
      
      if (connectionData && user?.uid) {
        handleConnectionComplete(JSON.parse(connectionData));
        sessionStorage.removeItem("google_calendar_connection");
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [user]);

  const handleConnectionComplete = async (connectionData) => {
    try {
      const tokens = {
        access_token: connectionData.accessToken,
        refresh_token: connectionData.refreshToken,
        expiry_date: connectionData.expiryDate,
      };

      const calendarInfo = {
        summary: connectionData.calendarName,
      };

      // Call the function directly instead of through API route
      const result = await connectGoogleCalendar(user.uid, tokens, calendarInfo);

      if (result.success) {
        alert("Google Calendar connected successfully!");
      } else {
        console.error("Failed to save Google Calendar connection");
        alert("Failed to connect Google Calendar. Please try again.");
      }
    } catch (error) {
      console.error("Error completing Google Calendar connection:", error);
      alert("Failed to connect Google Calendar. Please try again.");
    }
  };
}; 