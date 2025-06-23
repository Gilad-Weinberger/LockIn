"use client";

import {
  GRID_STYLE,
  getAllEventsForDate,
  isAllDayTask,
  getEventCategoryBgColor,
} from "./WeekViewUtils";

const WeekViewAllDaySection = ({
  weekDays,
  tasks,
  googleCalendarEvents = [],
  categories,
  allDayHeight,
  onTaskClick,
  error = null,
}) => {
  const handleEventClick = (event) => {
    // Allow clicking on both regular tasks and Google Calendar events
    onTaskClick(event);
  };

  return (
    <div
      className="border-b bg-gray-25 flex-shrink-0"
      style={{
        ...GRID_STYLE,
        minHeight: `${allDayHeight}px`,
      }}
    >
      <div className="px-4 py-2 text-xs font-medium text-gray-500 border-r">
        All Day
      </div>
      {weekDays.map((date, index) => {
        // Get all events (tasks + Google Calendar) for this date
        const allEvents = getAllEventsForDate(
          tasks,
          googleCalendarEvents,
          date
        );
        const allDayEvents = allEvents.filter((event) => isAllDayTask(event));

        return (
          <div
            key={index}
            className="px-2 py-2 border-r last:border-r-0"
            style={{ minHeight: `${allDayHeight}px` }}
          >
            <div className="space-y-1">
              {error && allDayEvents.length === 0 ? (
                <div className="text-xs text-red-400 px-1 py-1" title={error}>
                  Failed to load events
                </div>
              ) : (
                <>
                  {allDayEvents.slice(0, 2).map((event) => (
                    <div
                      key={`${event.type}-${event.id}`}
                      className={`text-xs p-1 rounded truncate hover:opacity-80 flex items-center cursor-pointer ${
                        event.isDone
                          ? "bg-green-100 text-green-800 line-through"
                          : getEventCategoryBgColor(
                              event.category,
                              categories,
                              event.isDone,
                              event.type
                            )
                      }`}
                      onClick={() => handleEventClick(event)}
                    >
                      {event.type === "google_calendar" && (
                        <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-1 flex-shrink-0"></span>
                      )}
                      <span className="truncate">{event.title}</span>
                    </div>
                  ))}
                  {allDayEvents.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{allDayEvents.length - 2}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekViewAllDaySection;
