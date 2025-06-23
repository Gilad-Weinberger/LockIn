"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGoogleCalendarIntegration } from "@/hooks/useGoogleCalendarIntegration";
import {
  getEventsForCalendarDisplay,
  getCategoryBgColor,
} from "@/lib/utils/google-calendar-integration";

const CalendarMonthView = ({ currentDate, tasks, onDateClick }) => {
  const { userData } = useAuth();
  const categories = userData?.categories || [];

  // Use our new Google Calendar integration
  const { googleEvents, settings } = useGoogleCalendarIntegration(
    tasks,
    currentDate,
    "month"
  );

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
    return getEventsForCalendarDisplay(
      tasks,
      googleEvents,
      date,
      settings.showGoogleEvents
    );
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
          gridTemplateRows: `repeat(${calendarData.numberOfWeeks}, minmax(0, 1fr))`,
        }}
      >
        {calendarData.days.map((date, index) => {
          const events = getEventsForDate(date);
          const isCurrentMonthDate = isCurrentMonth(date);
          const isTodayDate = isToday(date);

          return (
            <div
              key={index}
              className={`border-r border-b relative cursor-pointer transition-colors min-h-0 flex flex-col ${
                isTodayDate
                  ? "bg-blue-50"
                  : isCurrentMonthDate
                  ? "bg-white hover:bg-gray-50"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
              onClick={() => onDateClick(date, events)}
            >
              {/* Date number */}
              <div className="p-2 flex-shrink-0">
                <span
                  className={`text-sm font-medium ${
                    isTodayDate
                      ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      : isCurrentMonthDate
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>

              {/* Events */}
              <div className="flex-1 px-2 pb-2 overflow-hidden">
                <div className="space-y-1">
                  {events.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={event.id || eventIndex}
                      className={`text-xs px-2 py-1 rounded truncate ${getCategoryBgColor(
                        event.category,
                        event.isDone,
                        event.type,
                        categories
                      )}`}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div className="text-xs text-gray-500 px-2">
                      +{events.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarMonthView;
