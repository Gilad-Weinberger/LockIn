"use client";

import {
  getCategoryColor,
  getCategoryBgColor,
  getTaskStyle,
  getDisplayTime,
} from "./WeekViewUtils";

const WeekViewTaskEvent = ({ task, date, categories, onTaskClick }) => {
  const taskStyle = getTaskStyle(task, date);
  if (!taskStyle) return null;

  const { displayTime, endTime } = getDisplayTime(task);
  const borderColor = getCategoryColor(task.category, categories);

  return (
    <div
      className={`absolute left-1 right-1 rounded-md shadow-sm border-l-2 cursor-pointer overflow-hidden ${
        task.isDone
          ? "bg-green-100 text-green-800 border-green-400 line-through"
          : `${getCategoryBgColor(
              task.category,
              categories,
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
        onTaskClick(task);
      }}
    >
      <div className="p-1 h-full flex flex-col justify-start">
        <div className="text-xs font-medium leading-tight">{task.title}</div>
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
