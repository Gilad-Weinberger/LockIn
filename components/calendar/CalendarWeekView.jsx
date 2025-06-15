"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  updateTask,
  CATEGORY_COLORS,
  UNCATEGORIZED_COLOR,
} from "@/lib/functions/taskFunctions";
import CalendarTaskForm from "./CalendarTaskForm";

const CalendarWeekView = ({ currentDate, tasks, onDateClick }) => {
  const [editingTask, setEditingTask] = useState(null);
  const { userData } = useAuth();
  const categories = userData?.categories || [];

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

  // Calculate dynamic all-day section height
  const allDayHeight = useMemo(() => {
    let maxAllDayEvents = 0;

    weekData.days.forEach((date) => {
      const dayTasks = getTasksForDate(date);
      const allDayTasks = dayTasks.filter((task) => isAllDayTask(task));
      maxAllDayEvents = Math.max(maxAllDayEvents, allDayTasks.length);
    });

    return (maxAllDayEvents + 1) * 20;
  }, [weekData.days, tasks]);

  // Helper function to get category color
  const getCategoryColor = (category) => {
    if (!category) return UNCATEGORIZED_COLOR;

    const categoryIndex = categories.findIndex((cat) => cat === category);
    if (categoryIndex === -1) return UNCATEGORIZED_COLOR;

    return CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length];
  };

  // Helper function to get category background color
  const getCategoryBgColor = (category, isDone) => {
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

  // Helper function to calculate task positioning and dimensions
  const getTaskStyle = (task, date) => {
    if (!task.startDate || !task.endDate) return null;

    const startDate = task.startDate.toDate
      ? task.startDate.toDate()
      : new Date(task.startDate);
    const endDate = task.endDate.toDate
      ? task.endDate.toDate()
      : new Date(task.endDate);

    // Get the start of the current day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    // Get the end of the current day
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Calculate effective start and end times for this day
    const effectiveStart = startDate < dayStart ? dayStart : startDate;
    const effectiveEnd = endDate > dayEnd ? dayEnd : endDate;

    // If the task doesn't actually occur on this day, return null
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
    const height = Math.max(15, (durationMinutes * HOUR_HEIGHT) / 60); // Minimum 15px height

    return {
      top: topPosition,
      height: height,
      zIndex: 10,
    };
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleTaskClick = (task) => {
    setEditingTask(task);
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

      {/* All-day events section - Dynamic height */}
      <div
        className="border-b bg-gray-25 flex-shrink-0"
        style={{
          ...gridStyle,
          minHeight: `${allDayHeight}px`,
        }}
      >
        <div className="px-4 py-2 text-xs font-medium text-gray-500 border-r">
          All Day
        </div>
        {weekData.days.map((date, index) => {
          const dayTasks = getTasksForDate(date);
          const allDayTasks = dayTasks.filter((task) => isAllDayTask(task));

          return (
            <div
              key={index}
              className="px-2 py-2 border-r last:border-r-0"
              style={{ minHeight: `${allDayHeight}px` }}
            >
              <div className="space-y-1">
                {allDayTasks.slice(0, 2).map((task) => (
                  <div
                    key={task.id}
                    className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${
                      task.isDone
                        ? "bg-green-100 text-green-800 line-through"
                        : getCategoryBgColor(task.category, task.isDone)
                    }`}
                    onClick={() => handleTaskClick(task)}
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

        <div className="relative" style={gridStyle}>
          {/* Time slots (background grid) */}
          {timeSlots.map((hour) => (
            <div key={hour} className="contents">
              {/* Time label */}
              <div className="px-4 py-2 text-xs text-gray-500 border-r border-b border-gray-100 h-[40px] flex items-start">
                {hour === 0
                  ? "12 AM"
                  : hour < 12
                  ? `${hour} AM`
                  : hour === 12
                  ? "12 PM"
                  : `${hour - 12} PM`}
              </div>

              {/* Day columns */}
              {weekData.days.map((date, dayIndex) => (
                <div
                  key={dayIndex}
                  className="border-r last:border-r-0 border-b border-gray-100 h-[40px] cursor-pointer hover:bg-blue-25 transition-colors"
                  onClick={() => onDateClick(date)}
                />
              ))}
            </div>
          ))}

          {/* Positioned task events */}
          {weekData.days.map((date, dayIndex) => {
            const dayTasks = getTasksForDate(date);
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
                  height: `${timeSlots.length * 40}px`,
                  pointerEvents: "none",
                }}
              >
                {timedTasks.map((task) => {
                  const taskStyle = getTaskStyle(task, date);
                  if (!taskStyle) return null;

                  // Get display time from startDate for scheduled tasks
                  let displayTime = "";
                  let endTime = "";
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

                  const borderColor = getCategoryColor(task.category);

                  return (
                    <div
                      key={task.id}
                      className={`absolute left-1 right-1 rounded-md shadow-sm border-l-2 cursor-pointer overflow-hidden ${
                        task.isDone
                          ? "bg-green-100 text-green-800 border-green-400 line-through"
                          : `${getCategoryBgColor(
                              task.category,
                              task.isDone
                            )} ${borderColor}`
                      }`}
                      style={{
                        top: `${taskStyle.top}px`,
                        height: `${taskStyle.height}px`,
                        zIndex: taskStyle.zIndex,
                        pointerEvents: "auto",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskClick(task);
                      }}
                    >
                      <div className="p-1 h-full flex flex-col justify-start">
                        <div className="text-xs font-medium leading-tight">
                          {task.title}
                        </div>
                        {displayTime && taskStyle.height > 30 && (
                          <div className="text-xs opacity-75 leading-tight">
                            {endTime
                              ? `${displayTime} - ${endTime}`
                              : displayTime}
                          </div>
                        )}
                        {task.description && taskStyle.height > 50 && (
                          <div className="text-xs opacity-75 leading-tight mt-1 overflow-hidden">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Task Modal */}
      <CalendarTaskForm
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        task={editingTask}
      />
    </div>
  );
};

export default CalendarWeekView;
