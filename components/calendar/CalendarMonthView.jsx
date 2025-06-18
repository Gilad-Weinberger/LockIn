"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { CATEGORY_COLORS } from "@/lib/functions/taskFunctions";

const CalendarMonthView = ({
  currentDate,
  tasks,
  googleCalendarEvents = [],
  onDateClick,
}) => {
  const { userData } = useAuth();
  const categories = userData?.categories || [];

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of the month and last day
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get start of calendar grid (Sunday of first week)
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    // Get end of calendar grid (Saturday of last week)
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    // Generate calendar grid
    const days = [];
    const currentDay = new Date(startDate);

    while (currentDay <= endDate) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    // Calculate number of weeks needed
    const numberOfWeeks = Math.ceil(days.length / 7);

    return {
      days,
      firstDay,
      lastDay,
      month,
      year,
      numberOfWeeks,
    };
  }, [currentDate]);

  const getEventsForDate = (date) => {
    const events = [];

    // Add scheduled tasks
    if (tasks && tasks.length > 0) {
      const dayTasks = tasks.filter((task) => {
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

        // Fallback to taskDate if startDate/endDate not available (now handles full timestamps)
        if (!task.taskDate) return false;
        const taskDate = new Date(task.taskDate);
        return (
          taskDate.getDate() === date.getDate() &&
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getFullYear() === date.getFullYear()
        );
      });

      events.push(...dayTasks.map((task) => ({ ...task, type: "task" })));

      // Get Google Calendar event IDs that are already synced as tasks
      const syncedGoogleEventIds = new Set(
        dayTasks
          .filter((task) => task.googleCalendarEventId)
          .map((task) => task.googleCalendarEventId)
      );

      // Add Google Calendar events (but exclude ones that are already synced as tasks)
      if (googleCalendarEvents && googleCalendarEvents.length > 0) {
        const dayGoogleEvents = googleCalendarEvents.filter((event) => {
          if (!event.start) return false;

          const eventStart = new Date(event.start);
          const eventEnd = event.end ? new Date(event.end) : eventStart;

          // Check if the event occurs on this date
          const currentDateStart = new Date(date);
          currentDateStart.setHours(0, 0, 0, 0);
          const currentDateEnd = new Date(date);
          currentDateEnd.setHours(23, 59, 59, 999);

          return eventStart <= currentDateEnd && eventEnd >= currentDateStart;
        });

        // Filter out Google Calendar events that are already synced as tasks
        const uniqueGoogleEvents = dayGoogleEvents.filter(
          (event) => !syncedGoogleEventIds.has(event.id)
        );

        events.push(
          ...uniqueGoogleEvents.map((event) => ({
            ...event,
            type: "google_calendar",
            category: "Google Calendar", // Add a category for styling
          }))
        );
      }
    }

    return events;
  };

  // Helper function to get category background color
  const getCategoryBgColor = (category, isDone, type) => {
    if (isDone) return "bg-green-100 text-green-800";

    // Special styling for Google Calendar events
    if (type === "google_calendar") {
      return "bg-purple-100 text-purple-800 border-l-2 border-purple-500";
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

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === calendarData.month;
  };

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header with weekdays */}
      <div className="grid grid-cols-7 border-b bg-gray-50 flex-shrink-0">
        {weekdays.map((day) => (
          <div
            key={day}
            className="px-4 py-3 text-sm font-semibold text-gray-700 text-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid - dynamic rows based on weeks needed */}
      <div
        className={`grid grid-cols-7 flex-1 overflow-hidden gap-0 h-full`}
        style={{
          gridTemplateRows: `repeat(${calendarData.numberOfWeeks}, 1fr)`,
        }}
      >
        {calendarData.days.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const isCurrentMonthDate = isCurrentMonth(date);
          const isTodayDate = isToday(date);

          // Calculate if this is in the last row based on dynamic week count
          const lastRowStartIndex = (calendarData.numberOfWeeks - 1) * 7;
          const isLastRow = index >= lastRowStartIndex;

          return (
            <div
              key={index}
              className={`${
                isLastRow ? "border-r" : "border-b border-r"
              } border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col min-h-0 ${
                !isCurrentMonthDate ? "bg-gray-50 text-gray-400" : ""
              } ${isTodayDate ? "bg-blue-50" : ""}`}
              onClick={() => onDateClick(date)}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-1 flex-shrink-0">
                <span
                  className={`text-sm font-medium ${
                    isTodayDate
                      ? "bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                      : isCurrentMonthDate
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  {date.getDate()}
                </span>
                {dayEvents.length > 2 && (
                  <span className="text-xs text-gray-500">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {/* Events (tasks + Google Calendar) for this date */}
              <div
                className={`space-y-1 flex-1 min-h-0 ${
                  dayEvents.length > 2
                    ? "overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
                    : "overflow-hidden"
                }`}
              >
                {dayEvents.map((event, eventIndex) => (
                  <div
                    key={`${event.type}-${event.id || eventIndex}`}
                    className={`text-xs p-1 rounded truncate flex-shrink-0 ${
                      event.type === "task" && event.isDone
                        ? "bg-green-100 text-green-800 line-through"
                        : getCategoryBgColor(
                            event.category,
                            event.isDone,
                            event.type
                          )
                    }`}
                    style={{ height: "20px" }}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarMonthView;
