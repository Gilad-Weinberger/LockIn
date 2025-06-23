"use client";

import { getAllEventsForDate, isAllDayTask, TIME_SLOTS } from "./WeekViewUtils";
import WeekViewTaskEvent from "./WeekViewTaskEvent";

const WeekViewTaskEvents = ({
  weekDays,
  tasks,
  googleCalendarEvents = [],
  categories,
  onTaskClick,
  error = null,
}) => {
  return (
    <>
      {weekDays.map((date, dayIndex) => {
        // Get all events (tasks + Google Calendar) for this date
        const allEvents = getAllEventsForDate(
          tasks,
          googleCalendarEvents,
          date
        );
        const timedEvents = allEvents.filter((event) => !isAllDayTask(event));

        // Calculate the column width and position
        const timeColumnWidth = 100; // 100px for time column
        const dayColumnWidth = `calc((100% - ${timeColumnWidth}px) / 7)`;
        const leftPosition = `calc(${timeColumnWidth}px + (${dayIndex} * (100% - ${timeColumnWidth}px) / 7))`;

        return (
          <div
            key={`events-${dayIndex}`}
            className="absolute"
            style={{
              left: leftPosition,
              width: dayColumnWidth,
              top: 0,
              height: `${TIME_SLOTS.length * 40}px`,
              pointerEvents: "none",
            }}
          >
            {timedEvents.map((event) => (
              <WeekViewTaskEvent
                key={`${event.type}-${event.id}`}
                task={event}
                date={date}
                categories={categories}
                onTaskClick={onTaskClick}
              />
            ))}
          </div>
        );
      })}
    </>
  );
};

export default WeekViewTaskEvents;
