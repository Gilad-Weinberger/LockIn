"use client";

import { useMemo } from "react";

const CalendarMonthView = ({ currentDate, tasks, onDateClick }) => {
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

    return {
      days,
      firstDay,
      lastDay,
      month,
      year,
    };
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

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1 overflow-hidden">
        {calendarData.days.map((date, index) => {
          const dayTasks = getTasksForDate(date);
          const isCurrentMonthDate = isCurrentMonth(date);
          const isTodayDate = isToday(date);

          return (
            <div
              key={index}
              className={`border-b border-r border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col ${
                !isCurrentMonthDate ? "bg-gray-50 text-gray-400" : ""
              } ${isTodayDate ? "bg-blue-50" : ""}`}
              onClick={() => onDateClick(date)}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
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
                {dayTasks.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {dayTasks.length}
                  </span>
                )}
              </div>

              {/* Tasks for this date */}
              <div className="space-y-1 flex-1 overflow-hidden">
                {dayTasks.slice(0, 3).map((task) => (
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
                {dayTasks.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarMonthView;
