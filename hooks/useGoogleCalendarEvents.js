import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

export const useGoogleCalendarEvents = (currentDate, view) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDateRange = useCallback(() => {
    if (!currentDate) return null;

    let timeMin, timeMax;

    if (view === 'week') {
      // Get the start and end of the current week
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      timeMin = startOfWeek.toISOString();
      timeMax = endOfWeek.toISOString();
    } else {
      // Get the start and end of the current month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      timeMin = startOfMonth.toISOString();
      timeMax = endOfMonth.toISOString();
    }

    return { timeMin, timeMax };
  }, [currentDate, view]);

  const fetchEvents = useCallback(async () => {
    if (!user?.uid) {
      setEvents([]);
      return;
    }

    const dateRange = getDateRange();
    if (!dateRange) return;

    setIsLoading(true);
    setError(null);

    try {
      const { timeMin, timeMax } = dateRange;
      const response = await fetch(
        `/api/calendar/google/events?userId=${user.uid}&timeMin=${timeMin}&timeMax=${timeMax}`
      );

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      } else {
        const errorData = await response.json();
        if (response.status === 401) {
          // Token expired or invalid, but not a critical error
          console.warn('Google Calendar access token expired');
          setEvents([]);
        } else {
          throw new Error(errorData.error || 'Failed to fetch events');
        }
      }
    } catch (err) {
      console.error('Error fetching Google Calendar events:', err);
      setError(err.message);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, getDateRange]);

  // Fetch events when dependencies change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Refresh events function for manual refresh
  const refreshEvents = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    isLoading,
    error,
    refreshEvents,
  };
}; 