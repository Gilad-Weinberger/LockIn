"use client";

import {
  GRID_STYLE,
  getTasksForDate,
  isAllDayTask,
  getCategoryBgColor,
} from "./WeekViewUtils";

const WeekViewAllDaySection = ({
  weekDays,
  tasks,
  categories,
  allDayHeight,
  onTaskClick,
}) => {
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
        const dayTasks = getTasksForDate(tasks, date);
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
                      : getCategoryBgColor(
                          task.category,
                          categories,
                          task.isDone
                        )
                  }`}
                  onClick={() => onTaskClick(task)}
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
  );
};

export default WeekViewAllDaySection;
