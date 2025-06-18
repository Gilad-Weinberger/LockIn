"use client";

import {
  getCategoryColor,
  getTaskStyle,
  getDisplayTime,
  getEventCategoryBgColor,
  getEventBorderColor,
} from "./WeekViewUtils";

const WeekViewTaskEvent = ({ task, date, categories, onTaskClick }) => {
  const taskStyle = getTaskStyle(task, date);
  if (!taskStyle) return null;

  const { displayTime, endTime } = getDisplayTime(task);
  const borderColor = getEventBorderColor(task.category, categories, task.type);
  const bgColor = getEventCategoryBgColor(
    task.category,
    categories,
    task.isDone,
    task.type
  );

  const handleClick = (e) => {
    e.stopPropagation();
    // Allow clicking on both regular tasks and Google Calendar events
    onTaskClick(task);
  };

  return (
    <div
      className={`absolute left-1 right-1 rounded-md shadow-sm border-l-2 overflow-hidden cursor-pointer ${
        task.isDone
          ? "bg-green-100 text-green-800 border-green-400 line-through"
          : `${bgColor} ${borderColor}`
      }`}
      style={{
        top: `${taskStyle.top}px`,
        height: `${taskStyle.height}px`,
        zIndex: taskStyle.zIndex,
        pointerEvents: "auto",
      }}
      onClick={handleClick}
    >
      <div className="p-1 h-full flex flex-col justify-start">
        <div className="text-xs font-medium leading-tight flex items-start">
          {task.type === "google_calendar" && (
            <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-1 mt-1 flex-shrink-0"></span>
          )}
          <span className="flex-1">{task.title}</span>
        </div>
        {displayTime && taskStyle.height > 30 && (
          <div className="text-xs opacity-75 leading-tight">
            {endTime ? `${displayTime} - ${endTime}` : displayTime}
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
};

export default WeekViewTaskEvent;
