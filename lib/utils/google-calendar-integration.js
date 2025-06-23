/**
 * Google Calendar Integration Utilities
 * Provides helper functions for integrating Google Calendar events with tasks
 */

/**
 * Get events for calendar display (both tasks and Google Calendar events)
 * @param {Array} tasks - Array of tasks
 * @param {Array} googleEvents - Array of Google Calendar events
 * @param {Date} date - Date to filter events for
 * @param {boolean} showGoogleEvents - Whether to include Google Calendar events
 * @returns {Array} Combined array of events for display
 */
export const getEventsForCalendarDisplay = (
  tasks,
  googleEvents,
  date,
  showGoogleEvents = true
) => {
  if (!date) return [];

  const targetDate = new Date(date);
  const targetDateString = targetDate.toDateString();

  // Filter tasks for the specific date
  const dayTasks = tasks.filter((task) => {
    // Check if task has a scheduled date
    if (task.startDate) {
      const taskDate = task.startDate.toDate
        ? task.startDate.toDate()
        : new Date(task.startDate);
      return taskDate.toDateString() === targetDateString;
    }

    // Check if task has a due date (for tasks without start date)
    if (task.dueDate && !task.startDate) {
      const dueDate = task.dueDate.toDate
        ? task.dueDate.toDate()
        : new Date(task.dueDate);
      return dueDate.toDateString() === targetDateString;
    }

    return false;
  });

  // Add Google Calendar events if enabled
  let combinedEvents = [...dayTasks];

  if (showGoogleEvents && googleEvents && googleEvents.length > 0) {
    // Get task Google Calendar event IDs to avoid duplicates
    const syncedEventIds = new Set(
      dayTasks
        .filter((task) => task.googleCalendarEventId)
        .map((task) => task.googleCalendarEventId)
    );

    // Filter Google Calendar events for the date and exclude duplicates
    const dayGoogleEvents = googleEvents
      .filter((event) => {
        // Skip if this event is already synced as a task
        if (syncedEventIds.has(event.id)) return false;

        // Check if event is on the target date
        if (event.start) {
          let eventDate;

          // Handle different start time formats from Google Calendar API
          if (event.start.date) {
            // All-day event
            eventDate = new Date(event.start.date + "T00:00:00");
          } else if (event.start.dateTime) {
            // Timed event
            eventDate = new Date(event.start.dateTime);
          } else if (typeof event.start === "string") {
            // Direct string format
            eventDate = new Date(event.start);
          } else {
            return false;
          }

          // Use local date comparison to avoid timezone issues
          const eventLocalDate = new Date(
            eventDate.getFullYear(),
            eventDate.getMonth(),
            eventDate.getDate()
          );
          const targetLocalDate = new Date(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            targetDate.getDate()
          );

          return eventLocalDate.getTime() === targetLocalDate.getTime();
        }

        return false;
      })
      .map((event) => ({
        ...event,
        type: "google_calendar",
        title: event.summary || event.title || "Untitled Event",
        start: event.start?.dateTime || event.start?.date || event.start,
        end: event.end?.dateTime || event.end?.date || event.end,
        // Ensure compatibility with task structure
        category: null, // Google Calendar events don't have categories
        isDone: false, // Google Calendar events aren't tasks
      }));

    combinedEvents = [...combinedEvents, ...dayGoogleEvents];
  }

  return combinedEvents;
};

/**
 * Get background color class for task/event category
 * @param {string} category - Category name
 * @param {boolean} isDone - Whether task is completed
 * @param {string} type - Type of event ('google_calendar' or regular task)
 * @param {Array} categories - Array of user categories
 * @returns {string} CSS class string
 */
export const getCategoryBgColor = (
  category,
  isDone = false,
  type = "task",
  categories = []
) => {
  // Google Calendar events have a specific styling
  if (type === "google_calendar") {
    return "bg-purple-100 text-purple-800 border border-purple-200";
  }

  // Completed tasks have muted styling
  if (isDone) {
    return "bg-gray-100 text-gray-500 line-through";
  }

  // Find category color from user's categories
  const categoryData = categories.find((cat) => cat.name === category);

  if (categoryData?.color) {
    const colorMap = {
      red: "bg-red-100 text-red-800",
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      yellow: "bg-yellow-100 text-yellow-800",
      purple: "bg-purple-100 text-purple-800",
      pink: "bg-pink-100 text-pink-800",
      indigo: "bg-indigo-100 text-indigo-800",
      orange: "bg-orange-100 text-orange-800",
      teal: "bg-teal-100 text-teal-800",
      cyan: "bg-cyan-100 text-cyan-800",
    };

    return colorMap[categoryData.color] || "bg-gray-100 text-gray-800";
  }

  // Default styling for uncategorized tasks
  return "bg-gray-100 text-gray-800";
};

/**
 * Format time for display in calendar
 * @param {string|Date} time - Time string or Date object
 * @returns {string} Formatted time string
 */
export const formatTimeForDisplay = (time) => {
  if (!time) return "";

  try {
    const date = typeof time === "string" ? new Date(time) : time;

    if (isNaN(date.getTime())) return "";

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "";
  }
};

/**
 * Check if an event is all-day
 * @param {Object} event - Event object
 * @returns {boolean} Whether the event is all-day
 */
export const isAllDayEvent = (event) => {
  if (event.type === "google_calendar") {
    // Google Calendar all-day events have date instead of dateTime
    return event.start && !event.start.includes("T");
  }

  // For tasks, check if they have specific times set
  return !event.time && !event.startTime && !event.endTime;
};

/**
 * Get event duration in minutes
 * @param {Object} event - Event object
 * @returns {number} Duration in minutes
 */
export const getEventDuration = (event) => {
  if (!event.start || !event.end) return 60; // Default 1 hour

  try {
    const startTime = new Date(event.start);
    const endTime = new Date(event.end);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) return 60;

    return Math.max(15, (endTime - startTime) / (1000 * 60)); // Minimum 15 minutes
  } catch (error) {
    console.error("Error calculating event duration:", error);
    return 60;
  }
};

/**
 * Check if two events overlap
 * @param {Object} event1 - First event
 * @param {Object} event2 - Second event
 * @returns {boolean} Whether events overlap
 */
export const eventsOverlap = (event1, event2) => {
  if (!event1.start || !event1.end || !event2.start || !event2.end) {
    return false;
  }

  try {
    const start1 = new Date(event1.start);
    const end1 = new Date(event1.end);
    const start2 = new Date(event2.start);
    const end2 = new Date(event2.end);

    return start1 < end2 && start2 < end1;
  } catch (error) {
    console.error("Error checking event overlap:", error);
    return false;
  }
};

/**
 * Group overlapping events for better display
 * @param {Array} events - Array of events
 * @returns {Array} Array of event groups
 */
export const groupOverlappingEvents = (events) => {
  if (!events || events.length === 0) return [];

  const groups = [];
  const processedEvents = new Set();

  events.forEach((event) => {
    if (processedEvents.has(event.id)) return;

    const group = [event];
    processedEvents.add(event.id);

    // Find all events that overlap with this one
    events.forEach((otherEvent) => {
      if (
        otherEvent.id !== event.id &&
        !processedEvents.has(otherEvent.id) &&
        eventsOverlap(event, otherEvent)
      ) {
        group.push(otherEvent);
        processedEvents.add(otherEvent.id);
      }
    });

    groups.push(group);
  });

  return groups;
};

/**
 * Filter events by time range
 * @param {Array} events - Array of events
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Filtered events
 */
export const filterEventsByTimeRange = (events, startDate, endDate) => {
  if (!events || !startDate || !endDate) return [];

  return events.filter((event) => {
    if (!event.start) return false;

    try {
      const eventDate = new Date(event.start);
      return eventDate >= startDate && eventDate <= endDate;
    } catch (error) {
      console.error("Error filtering events by time range:", error);
      return false;
    }
  });
};
