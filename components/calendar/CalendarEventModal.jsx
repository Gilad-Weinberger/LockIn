"use client";

import { useMemo } from "react";

const CalendarEventModal = ({ isOpen, onClose, selectedDate, tasks }) => {
  const dayTasks = useMemo(() => {
    if (!selectedDate || !tasks || tasks.length === 0) return [];

    return tasks
      .filter((task) => {
        // For scheduled tasks, check if the date falls within startDate and endDate range
        if (task.startDate && task.endDate) {
          const startDate = task.startDate.toDate
            ? task.startDate.toDate()
            : new Date(task.startDate);
          const endDate = task.endDate.toDate
            ? task.endDate.toDate()
            : new Date(task.endDate);

          // Check if the selected date falls within the task's time range
          const selectedDateStart = new Date(selectedDate);
          selectedDateStart.setHours(0, 0, 0, 0);
          const selectedDateEnd = new Date(selectedDate);
          selectedDateEnd.setHours(23, 59, 59, 999);

          return startDate <= selectedDateEnd && endDate >= selectedDateStart;
        }

        // Fallback to taskDate for backward compatibility
        if (!task.taskDate) return false;
        const taskDate = new Date(task.taskDate);
        return (
          taskDate.getDate() === selectedDate.getDate() &&
          taskDate.getMonth() === selectedDate.getMonth() &&
          taskDate.getFullYear() === selectedDate.getFullYear()
        );
      })
      .sort((a, b) => {
        // Sort by start time for scheduled tasks
        if (a.startDate && b.startDate) {
          const aStart = a.startDate.toDate
            ? a.startDate.toDate()
            : new Date(a.startDate);
          const bStart = b.startDate.toDate
            ? b.startDate.toDate()
            : new Date(b.startDate);
          return aStart - bStart;
        }

        // Sort by time if available, otherwise by priority
        if (a.time && b.time) return a.time.localeCompare(b.time);
        if (a.time && !b.time) return -1;
        if (!a.time && b.time) return 1;

        const priorityOrder = { do: 0, plan: 1, delegate: 2, delete: 3 };
        return (
          (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
        );
      });
  }, [selectedDate, tasks]);

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Modal header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {formatDate(selectedDate)}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Modal body */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {dayTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon />
              <p className="mt-2">No tasks scheduled for this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    task.isDone
                      ? "bg-green-50 border-green-400"
                      : task.priority === "do"
                      ? "bg-red-50 border-red-400"
                      : task.priority === "plan"
                      ? "bg-yellow-50 border-yellow-400"
                      : task.priority === "delegate"
                      ? "bg-blue-50 border-blue-400"
                      : "bg-gray-50 border-gray-400"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4
                        className={`font-medium ${
                          task.isDone
                            ? "text-green-800 line-through"
                            : task.priority === "do"
                            ? "text-red-800"
                            : task.priority === "plan"
                            ? "text-yellow-800"
                            : task.priority === "delegate"
                            ? "text-blue-800"
                            : "text-gray-800"
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        {(task.startDate || task.time) && (
                          <span className="flex items-center">
                            <ClockIcon />
                            <span className="ml-1">
                              {task.startDate
                                ? (() => {
                                    const startDate = task.startDate.toDate
                                      ? task.startDate.toDate()
                                      : new Date(task.startDate);
                                    const endDate = task.endDate
                                      ? task.endDate.toDate
                                        ? task.endDate.toDate()
                                        : new Date(task.endDate)
                                      : null;
                                    const startTime =
                                      startDate.toLocaleTimeString("en-US", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                      });
                                    const endTime = endDate
                                      ? endDate.toLocaleTimeString("en-US", {
                                          hour: "numeric",
                                          minute: "2-digit",
                                          hour12: true,
                                        })
                                      : null;
                                    return endTime
                                      ? `${startTime} - ${endTime}`
                                      : startTime;
                                  })()
                                : task.time}
                            </span>
                          </span>
                        )}
                        {task.category && (
                          <span className="flex items-center">
                            <TagIcon />
                            <span className="ml-1">{task.category}</span>
                          </span>
                        )}
                        {task.priority && (
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              task.priority === "do"
                                ? "bg-red-100 text-red-700"
                                : task.priority === "plan"
                                ? "bg-yellow-100 text-yellow-700"
                                : task.priority === "delegate"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {task.priority.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    {task.isDone && (
                      <div className="flex-shrink-0 ml-3">
                        <CheckIcon />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Icons
const CloseIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    className="w-12 h-12 mx-auto text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="w-3 h-3"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const TagIcon = () => (
  <svg
    className="w-3 h-3"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 7h.01M7 3h5l1.586 1.586a2 2 0 010 2.828l-6.586 6.586a2 2 0 01-2.828 0l-6.586-6.586a2 2 0 010-2.828L3 7z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-5 h-5 text-green-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

export default CalendarEventModal;
