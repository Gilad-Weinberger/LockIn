import {
  CATEGORY_COLORS,
  UNCATEGORIZED_COLOR,
} from "@/lib/functions/taskFunctions";

// Helper function to get category color
export const getCategoryColor = (category, categories) => {
  if (!category) return UNCATEGORIZED_COLOR;

  const categoryIndex = categories.findIndex((cat) => cat === category);
  if (categoryIndex === -1) return UNCATEGORIZED_COLOR;

  return CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length];
};

// Helper function to get category background color
export const getCategoryBgColor = (category, categories, isDone) => {
  if (isDone) return "bg-green-100 text-green-800";

  if (!category) return "bg-gray-100 text-gray-800";

  const categoryIndex = categories.findIndex((cat) => cat === category);
  if (categoryIndex === -1) return "bg-gray-100 text-gray-800";

  const colorIndex = categoryIndex % CATEGORY_COLORS.length;
  const bgColors = [
    "bg-blue-100 text-blue-800",
    "bg-pink-100 text-pink-800",
    "bg-green-100 text-green-800",
    "bg-yellow-100 text-yellow-800",
    "bg-purple-100 text-purple-800",
    "bg-red-100 text-red-800",
    "bg-indigo-100 text-indigo-800",
    "bg-teal-100 text-teal-800",
    "bg-orange-100 text-orange-800",
    "bg-cyan-100 text-cyan-800",
    "bg-lime-100 text-lime-800",
    "bg-amber-100 text-amber-800",
    "bg-fuchsia-100 text-fuchsia-800",
    "bg-emerald-100 text-emerald-800",
    "bg-sky-100 text-sky-800",
  ];

  return bgColors[colorIndex];
};

// Generate week data from current date
export const generateWeekData = (currentDate) => {
  // Get the start of the week (Sunday)
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  // Generate 7 days for the week
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }

  return { days, startOfWeek };
};

// Filter tasks for a specific date
export const getTasksForDate = (tasks, date) => {
  if (!tasks || tasks.length === 0) return [];

  return tasks.filter((task) => {
    // For scheduled tasks, check if the date falls within startDate and endDate range
    if (task.startDate && task.endDate) {
      const startDate = task.startDate.toDate
        ? task.startDate.toDate()
        : new Date(task.startDate);
      const endDate = task.endDate.toDate
        ? task.endDate.toDate()
        : new Date(task.endDate);

      // Check if the current date falls within the task's time range
      const currentDateStart = new Date(date);
      currentDateStart.setHours(0, 0, 0, 0);
      const currentDateEnd = new Date(date);
      currentDateEnd.setHours(23, 59, 59, 999);

      return startDate <= currentDateEnd && endDate >= currentDateStart;
    }

    // Fallback to taskDate if startDate/endDate not available
    if (!task.taskDate) return false;
    const taskDate = new Date(task.taskDate);
    return (
      taskDate.getDate() === date.getDate() &&
      taskDate.getMonth() === date.getMonth() &&
      taskDate.getFullYear() === date.getFullYear()
    );
  });
};

// Filter Google Calendar events for a specific date
export const getGoogleCalendarEventsForDate = (googleCalendarEvents, date) => {
  if (!googleCalendarEvents || googleCalendarEvents.length === 0) return [];

  const targetDate = new Date(date);

  return googleCalendarEvents.filter((event) => {
    if (!event.start) return false;

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
  });
};

// Get all events (tasks + Google Calendar) for a specific date
export const getAllEventsForDate = (tasks, googleCalendarEvents, date) => {
  const events = [];

  // Add regular tasks
  const dayTasks = getTasksForDate(tasks, date);
  events.push(...dayTasks.map((task) => ({ ...task, type: "task" })));

  // Get Google Calendar event IDs that are already synced as tasks
  const syncedGoogleEventIds = new Set(
    dayTasks
      .filter((task) => task.googleCalendarEventId)
      .map((task) => task.googleCalendarEventId)
  );

  // Add Google Calendar events (but exclude ones that are already synced as tasks)
  const dayGoogleEvents = getGoogleCalendarEventsForDate(
    googleCalendarEvents,
    date
  );
  const uniqueGoogleEvents = dayGoogleEvents.filter(
    (event) => !syncedGoogleEventIds.has(event.id)
  );

  events.push(
    ...uniqueGoogleEvents.map((event) => ({
      ...event,
      type: "google_calendar",
      id: event.id || `google-${Date.now()}-${Math.random()}`,
      title: event.title || event.summary || "Google Calendar Event",
      category: null, // Google Calendar events don't have categories
      // Convert Google Calendar event times to match task format
      startDate: event.start ? new Date(event.start) : null,
      endDate: event.end ? new Date(event.end) : null,
      // Mark as all-day if it doesn't have specific times
      isAllDay: event.allDay || !event.start?.includes("T"),
      isDone: false, // Google Calendar events can't be marked as done
    }))
  );

  return events;
};

// Helper function to determine if a task or Google Calendar event is all-day
export const isAllDayTask = (task) => {
  // Handle Google Calendar events
  if (task.type === "google_calendar") {
    return task.isAllDay || task.allDay || !task.start?.includes("T");
  }

  // If task has startDate and endDate, check if it's an all-day event
  if (task.startDate && task.endDate) {
    const startDate = task.startDate.toDate
      ? task.startDate.toDate()
      : new Date(task.startDate);
    const endDate = task.endDate.toDate
      ? task.endDate.toDate()
      : new Date(task.endDate);

    // Check if the event spans entire days
    const isMultipleDays =
      endDate.getDate() !== startDate.getDate() ||
      endDate.getMonth() !== startDate.getMonth() ||
      endDate.getFullYear() !== startDate.getFullYear();

    const startsAtMidnight =
      startDate.getHours() === 0 &&
      startDate.getMinutes() === 0 &&
      startDate.getSeconds() === 0;
    const endsAtMidnight =
      endDate.getHours() === 0 &&
      endDate.getMinutes() === 0 &&
      endDate.getSeconds() === 0;

    return (
      isMultipleDays ||
      (startsAtMidnight && endsAtMidnight) ||
      task.isAllDay === true
    );
  }

  // Fallback: if no time specified and not scheduled, consider it all-day
  return !task.time;
};

// Calculate task positioning and dimensions for time grid
export const getTaskStyle = (task, date) => {
  let startDate, endDate;

  // Handle Google Calendar events
  if (task.type === "google_calendar") {
    startDate = task.start ? new Date(task.start) : null;
    endDate = task.end ? new Date(task.end) : startDate;
  } else {
    // Handle regular tasks
    if (!task.startDate || !task.endDate) return null;
    startDate = task.startDate.toDate
      ? task.startDate.toDate()
      : new Date(task.startDate);
    endDate = task.endDate.toDate
      ? task.endDate.toDate()
      : new Date(task.endDate);
  }

  if (!startDate || !endDate) return null;

  // Get the start and end of the current day
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  // Calculate effective start and end times for this day
  const effectiveStart = startDate < dayStart ? dayStart : startDate;
  const effectiveEnd = endDate > dayEnd ? dayEnd : endDate;

  // If the task doesn't occur on this day, return null
  if (effectiveStart > dayEnd || effectiveEnd < dayStart) {
    return null;
  }

  // Calculate positioning (each hour = 40px height)
  const HOUR_HEIGHT = 40;
  const startHour = effectiveStart.getHours();
  const startMinute = effectiveStart.getMinutes();
  const endHour = effectiveEnd.getHours();
  const endMinute = effectiveEnd.getMinutes();

  // Calculate top position in pixels from start of day
  const topPosition =
    startHour * HOUR_HEIGHT + (startMinute * HOUR_HEIGHT) / 60;

  // Calculate height in pixels
  const durationMinutes =
    endHour * 60 + endMinute - (startHour * 60 + startMinute);
  const height = Math.max(15, (durationMinutes * HOUR_HEIGHT) / 60);

  return {
    top: topPosition,
    height: height,
    zIndex: 10,
  };
};

// Check if date is today
export const isToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Calculate dynamic all-day section height
export const calculateAllDayHeight = (
  weekDays,
  tasks,
  googleCalendarEvents = []
) => {
  let maxAllDayEvents = 0;

  weekDays.forEach((date) => {
    const allEvents = getAllEventsForDate(tasks, googleCalendarEvents, date);
    const allDayEvents = allEvents.filter((event) => isAllDayTask(event));
    maxAllDayEvents = Math.max(maxAllDayEvents, allDayEvents.length);
  });

  return (maxAllDayEvents + 1) * 20;
};

// Format display time for tasks and Google Calendar events
export const getDisplayTime = (task) => {
  let displayTime = "";
  let endTime = "";

  // Handle Google Calendar events
  if (task.type === "google_calendar") {
    if (task.start && task.end) {
      const startDate = new Date(task.start);
      const endDate = new Date(task.end);

      displayTime = startDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      endTime = endDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
  } else {
    // Handle regular tasks
    if (task.startDate && task.endDate) {
      const startDate = task.startDate.toDate
        ? task.startDate.toDate()
        : new Date(task.startDate);
      const endDate = task.endDate.toDate
        ? task.endDate.toDate()
        : new Date(task.endDate);

      displayTime = startDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      endTime = endDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (task.time) {
      displayTime = task.time;
    }
  }

  return { displayTime, endTime };
};

// Helper function to get category background color for both tasks and Google Calendar events
export const getEventCategoryBgColor = (category, categories, isDone, type) => {
  if (isDone) return "bg-green-100 text-green-800";

  // Special styling for Google Calendar events
  if (type === "google_calendar") {
    return "bg-purple-100 text-purple-800";
  }

  if (!category) return "bg-gray-100 text-gray-800";

  const categoryIndex = categories.findIndex((cat) => cat === category);
  if (categoryIndex === -1) return "bg-gray-100 text-gray-800";

  const colorIndex = categoryIndex % CATEGORY_COLORS.length;
  const bgColors = [
    "bg-blue-100 text-blue-800",
    "bg-pink-100 text-pink-800",
    "bg-green-100 text-green-800",
    "bg-yellow-100 text-yellow-800",
    "bg-purple-100 text-purple-800",
    "bg-red-100 text-red-800",
    "bg-indigo-100 text-indigo-800",
    "bg-teal-100 text-teal-800",
    "bg-orange-100 text-orange-800",
    "bg-cyan-100 text-cyan-800",
    "bg-lime-100 text-lime-800",
    "bg-amber-100 text-amber-800",
    "bg-fuchsia-100 text-fuchsia-800",
    "bg-emerald-100 text-emerald-800",
    "bg-sky-100 text-sky-800",
  ];

  return bgColors[colorIndex];
};

// Helper function to get border color for Google Calendar events
export const getEventBorderColor = (category, categories, type) => {
  // Special border for Google Calendar events
  if (type === "google_calendar") {
    return "border-purple-500";
  }

  return getCategoryColor(category, categories);
};

// Grid style configuration
export const GRID_STYLE = {
  display: "grid",
  gridTemplateColumns: "100px repeat(7, 1fr)",
};

// Time slots for 24 hours
export const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => i);

// Weekday labels
export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
