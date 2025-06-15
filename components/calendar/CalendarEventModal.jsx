"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  updateTask,
  CATEGORY_COLORS,
  UNCATEGORIZED_COLOR,
} from "@/lib/functions/taskFunctions";
import CalendarTaskForm from "./CalendarTaskForm";

const CalendarEventModal = ({ isOpen, onClose, selectedDate, tasks }) => {
  const [editingTask, setEditingTask] = useState(null);
  const { userData } = useAuth();
  const categories = userData?.categories || [];

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

        // Fallback to taskDate for backward compatibility (now handles full timestamps)
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

  // Helper function to get category border color
  const getCategoryBorderColor = (category) => {
    if (!category) return "border-gray-400";

    const categoryIndex = categories.findIndex((cat) => cat === category);
    if (categoryIndex === -1) return "border-gray-400";

    return CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length];
  };

  // Helper function to get category background color
  const getCategoryBgColor = (category, isDone) => {
    if (isDone) return "bg-green-50";

    if (!category) return "bg-gray-50";

    const categoryIndex = categories.findIndex((cat) => cat === category);
    if (categoryIndex === -1) return "bg-gray-50";

    const colorIndex = categoryIndex % CATEGORY_COLORS.length;
    const bgColors = [
      "bg-blue-50",
      "bg-pink-50",
      "bg-green-50",
      "bg-yellow-50",
      "bg-purple-50",
      "bg-red-50",
      "bg-indigo-50",
      "bg-teal-50",
      "bg-orange-50",
      "bg-cyan-50",
      "bg-lime-50",
      "bg-amber-50",
      "bg-fuchsia-50",
      "bg-emerald-50",
      "bg-sky-50",
    ];

    return bgColors[colorIndex];
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
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
                      : `${getCategoryBgColor(
                          task.category,
                          task.isDone
                        )} ${getCategoryBorderColor(task.category)}`
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4
                        className={`font-medium ${
                          task.isDone
                            ? "text-green-800 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                        {task.startDate && (
                          <span className="flex items-center">
                            <ClockIcon />
                            <span className="ml-1">
                              {new Date(
                                task.startDate.toDate
                                  ? task.startDate.toDate()
                                  : task.startDate
                              ).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}
                              {task.endDate &&
                                " - " +
                                  new Date(
                                    task.endDate.toDate
                                      ? task.endDate.toDate()
                                      : task.endDate
                                  ).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                            </span>
                          </span>
                        )}
                        {task.category && (
                          <span className="flex items-center">
                            <TagIcon />
                            <span className="ml-1">{task.category}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      {task.isDone && (
                        <div className="flex-shrink-0">
                          <CheckIcon />
                        </div>
                      )}
                      <button
                        onClick={() => handleEditTask(task)}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-100 rounded transition-all duration-200"
                        aria-label="Edit task"
                        title="Edit task"
                      >
                        <EditIcon />
                      </button>
                    </div>
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

      {/* Edit Task Modal */}
      <CalendarTaskForm
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        task={editingTask}
      />
    </div>
  );
};

// Icons
const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-12 h-12 mx-auto text-gray-400"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const TagIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 6h.008v.008H6V6z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-5 h-5 text-green-600"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
    />
  </svg>
);

export default CalendarEventModal;
