"use client";

import { getTasksForDate, isAllDayTask, TIME_SLOTS } from "./WeekViewUtils";
import WeekViewTaskEvent from "./WeekViewTaskEvent";

const WeekViewTaskEvents = ({ weekDays, tasks, categories, onTaskClick }) => {
  return (
    <>
      {weekDays.map((date, dayIndex) => {
        const dayTasks = getTasksForDate(tasks, date);
        const timedTasks = dayTasks.filter((task) => !isAllDayTask(task));

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
            {timedTasks.map((task) => (
              <WeekViewTaskEvent
                key={task.id}
                task={task}
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
