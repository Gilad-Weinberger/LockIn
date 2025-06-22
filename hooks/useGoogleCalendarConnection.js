import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export const useGoogleCalendarConnection = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Handle connection completion from OAuth flow
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get("google_calendar_success") === "true") {
      if (user?.uid) {
        handleConnectionComplete();
        // Clean up URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    }

    async function handleConnectionComplete() {
      try {
        const response = await fetch("/api/calendar/google/connect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.uid,
          }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          alert(result.message || "Google Calendar connected successfully!");
        } else {
          console.error("Failed to connect Google Calendar:", result.error);
          alert(
            result.error ||
              "Failed to connect Google Calendar. Please try again."
          );
        }
      } catch (error) {
        console.error("Error completing Google Calendar connection:", error);
        alert("Failed to connect Google Calendar. Please try again.");
      }
    }
  }, [user]);
};
