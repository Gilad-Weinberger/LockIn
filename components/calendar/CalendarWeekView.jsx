"use client";

import { useMemo } from "react";

const CalendarWeekView = ({ currentDate, tasks, onDateClick }) => {
  const weekData = useMemo(() => {
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
  }, [currentDate]);

  const getTasksForDate = (date) => {
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

      // Fallback to taskDate if startDate/endDate not available (shouldn't happen for scheduled tasks)
      if (!task.taskDate) return false;
      const taskDate = new Date(task.taskDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Helper function to determine if a task is all-day
  const isAllDayTask = (task) => {
    // If task has startDate and endDate, check if it's an all-day event
    if (task.startDate && task.endDate) {
      const startDate = task.startDate.toDate
        ? task.startDate.toDate()
        : new Date(task.startDate);
      const endDate = task.endDate.toDate
        ? task.endDate.toDate()
        : new Date(task.endDate);

      // Check if the event spans entire days (starts at 00:00 and ends at 00:00 of next day or later)
      // or if it's explicitly marked as all-day
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

      // It's all-day if it's multiple days, or starts and ends at midnight, or has no specific time info
      return (
        isMultipleDays ||
        (startsAtMidnight && endsAtMidnight) ||
        task.isAllDay === true
      );
    }

    // Fallback: if no time specified and not scheduled, consider it all-day
    return !task.time;
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  // Define consistent grid template for all sections
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "100px repeat(7, 1fr)",
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header with days */}
      <div className="border-b bg-gray-50 flex-shrink-0" style={gridStyle}>
        {/* Time column header */}
        <div className="px-4 py-3 text-sm font-semibold text-gray-700 border-r">
          Time
        </div>

        {/* Day headers */}
        {weekData.days.map((date, index) => {
          const isTodayDate = isToday(date);
          return (
            <div
              key={index}
              className={`px-4 py-3 text-center border-r last:border-r-0 cursor-pointer hover:bg-gray-100 transition-colors ${
                isTodayDate ? "bg-blue-50" : ""
              }`}
              onClick={() => onDateClick(date)}
            >
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                {weekdays[index]}
              </div>
              <div
                className={`text-lg font-semibold mt-1 ${
                  isTodayDate
                    ? "bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto"
                    : "text-gray-900"
                }`}
              >
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* All-day events section - Fixed */}
      <div className="border-b bg-gray-25 flex-shrink-0" style={gridStyle}>
        <div className="px-4 py-2 text-xs font-medium text-gray-500 border-r">
          All Day
        </div>
        {weekData.days.map((date, index) => {
          const dayTasks = getTasksForDate(date);
          const allDayTasks = dayTasks.filter((task) => isAllDayTask(task));

          return (
            <div
              key={index}
              className="px-2 py-2 border-r last:border-r-0 min-h-[60px]"
            >
              <div className="space-y-1">
                {allDayTasks.slice(0, 2).map((task) => (
                  <div
                    key={task.id}
                    className={`text-xs p-1 rounded truncate ${
                      task.isDone
                        ? "bg-green-100 text-green-800 line-through"
                        : task.priority === "do"
                        ? "bg-red-100 text-red-800"
                        : task.priority === "plan"
                        ? "bg-yellow-100 text-yellow-800"
                        : task.priority === "delegate"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {task.title}
                  </div>
                ))}
                {allDayTasks.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{allDayTasks.length - 2}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendar body with time slots - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <style jsx>{`
          .scrollbar-hide {
            -webkit-overflow-scrolling: touch;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Time slots */}
        {timeSlots.map((hour) => (
          <div
            key={hour}
            className="border-b border-gray-100 hover:bg-gray-25 transition-colors"
            style={gridStyle}
          >
            {/* Time label */}
            <div className="px-4 py-4 text-xs text-gray-500 border-r">
              {hour === 0
                ? "12 AM"
                : hour < 12
                ? `${hour} AM`
                : hour === 12
                ? "12 PM"
                : `${hour - 12} PM`}
            </div>

            {/* Day columns */}
            {weekData.days.map((date, dayIndex) => {
              const dayTasks = getTasksForDate(date);
              const hourTasks = dayTasks.filter((task) => {
                // Skip all-day tasks - they should only appear in the all-day section
                if (isAllDayTask(task)) return false;

                // For scheduled tasks with specific times, check if the task starts in this hour
                if (task.startDate && task.endDate) {
                  const startDate = task.startDate.toDate
                    ? task.startDate.toDate()
                    : new Date(task.startDate);
                  return startDate.getHours() === hour;
                }

                // Fallback to time field for backward compatibility
                if (!task.time) return false;
                const taskHour = parseInt(task.time.split(":")[0]);
                return taskHour === hour;
              });

              return (
                <div
                  key={dayIndex}
                  className="px-2 py-4 border-r last:border-r-0 min-h-[60px] cursor-pointer hover:bg-blue-25 transition-colors"
                  onClick={() => onDateClick(date)}
                >
                  <div className="space-y-1">
                    {hourTasks.map((task) => {
                      // Get display time from startDate for scheduled tasks
                      let displayTime = "";
                      if (task.startDate) {
                        const startDate = task.startDate.toDate
                          ? task.startDate.toDate()
                          : new Date(task.startDate);
                        displayTime = startDate.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        });
                      } else if (task.time) {
                        displayTime = task.time;
                      }

                      return (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded truncate ${
                            task.isDone
                              ? "bg-green-100 text-green-800 line-through"
                              : task.priority === "do"
                              ? "bg-red-100 text-red-800"
                              : task.priority === "plan"
                              ? "bg-yellow-100 text-yellow-800"
                              : task.priority === "delegate"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {displayTime && (
                            <div className="font-medium">{displayTime}</div>
                          )}
                          <div>{task.title}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarWeekView;
