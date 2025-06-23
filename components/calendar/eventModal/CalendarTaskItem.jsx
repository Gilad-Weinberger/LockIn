import {
  ClockIcon,
  TagIcon,
  CheckIcon,
  EditIcon,
  CloseIcon,
} from "./CalendarIcons";
import { CATEGORY_COLORS, deleteTask } from "@/lib/functions/taskFunctions";

const CalendarTaskItem = ({ task, categories, onEditTask, onTaskDeleted }) => {
  // Helper function to get category border color
  const getCategoryBorderColor = (category, type) => {
    // Special styling for Google Calendar events
    if (type === "google_calendar") {
      return "border-purple-400";
    }

    if (!category) return "border-gray-400";

    const categoryIndex = categories.findIndex((cat) => cat === category);
    if (categoryIndex === -1) return "border-gray-400";

    return CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length];
  };

  // Helper function to get category background color
  const getCategoryBgColor = (category, isDone, type) => {
    if (isDone) return "bg-green-50";

    // Special styling for Google Calendar events
    if (type === "google_calendar") {
      return "bg-purple-50";
    }

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

  const formatTime = (date) => {
    return new Date(date.toDate ? date.toDate() : date).toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  const getEventTime = () => {
    // Check if it's an all-day event
    const isAllDay =
      task.isAllDay ||
      task.allDay ||
      (task.type === "google_calendar" &&
        task.start &&
        !task.start.includes("T")) ||
      (task.type === "task" &&
        task.startDate &&
        task.endDate &&
        (() => {
          const startDate = task.startDate.toDate
            ? task.startDate.toDate()
            : new Date(task.startDate);
          const endDate = task.endDate.toDate
            ? task.endDate.toDate()
            : new Date(task.endDate);
          const startsAtMidnight =
            startDate.getHours() === 0 && startDate.getMinutes() === 0;
          const endsAtMidnight =
            endDate.getHours() === 0 && endDate.getMinutes() === 0;
          const isMultipleDays =
            endDate.getDate() !== startDate.getDate() ||
            endDate.getMonth() !== startDate.getMonth() ||
            endDate.getFullYear() !== startDate.getFullYear();
          return isMultipleDays || (startsAtMidnight && endsAtMidnight);
        })());

    if (isAllDay) {
      return "All Day";
    }

    if (task.type === "google_calendar") {
      if (task.start && task.end) {
        const startTime = formatTime(new Date(task.start));
        const endTime = formatTime(new Date(task.end));
        return `${startTime} - ${endTime}`;
      } else if (task.start) {
        return formatTime(new Date(task.start));
      }
      return null;
    } else {
      // Regular task
      if (task.startDate && task.endDate) {
        return `${formatTime(task.startDate)} - ${formatTime(task.endDate)}`;
      } else if (task.startDate) {
        return formatTime(task.startDate);
      }
      return null;
    }
  };

  const handleDelete = async () => {
    // Only allow deletion of regular tasks (not Google Calendar events)
    if (task.type === "google_calendar") {
      alert(
        "Google Calendar events cannot be deleted from here. Please delete them from Google Calendar directly."
      );
      return;
    }

    // Confirm deletion, especially if it has a Google Calendar event
    const hasGoogleCalendarEvent = task.googleCalendarEventId;
    const confirmMessage = hasGoogleCalendarEvent
      ? `Are you sure you want to delete "${task.title}"?\n\nThis will also delete the associated Google Calendar event.`
      : `Are you sure you want to delete "${task.title}"?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      console.log(
        `🗑️ User initiated deletion of task "${task.title}"${
          hasGoogleCalendarEvent ? " (with Google Calendar event)" : ""
        }`
      );

      await deleteTask(task.id);

      // Optionally call a callback to refresh the task list
      if (onTaskDeleted) {
        onTaskDeleted(task.id);
      }

      console.log(`✅ Task "${task.title}" deletion completed`);
    } catch (err) {
      console.error("Failed to delete task:", err);
      alert("Failed to delete task. Please try again.");
    }
  };

  const eventTime = getEventTime();

  return (
    <div
      className={`p-4 rounded-lg border-l-4 group hover:shadow-md transition-shadow duration-200 ${
        task.isDone
          ? "bg-green-50 border-green-400"
          : `${getCategoryBgColor(
              task.category,
              task.isDone,
              task.type
            )} ${getCategoryBorderColor(task.category, task.type)}`
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start">
            {task.type === "google_calendar" && (
              <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2 mt-1 flex-shrink-0"></span>
            )}
            <h4
              className={`font-medium ${
                task.isDone ? "text-green-800 line-through" : "text-gray-900"
              }`}
            >
              {task.title}
            </h4>
          </div>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
            {eventTime && (
              <span className="flex items-center">
                <ClockIcon />
                <span className="ml-1">{eventTime}</span>
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
          {/* Action buttons - only show on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* Edit button */}
            <button
              onClick={() => onEditTask(task)}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-100 rounded transition-all duration-200"
              aria-label={`Edit ${
                task.type === "google_calendar"
                  ? "Google Calendar event"
                  : "task"
              }`}
              title={`Edit ${
                task.type === "google_calendar"
                  ? "Google Calendar event"
                  : "task"
              }`}
            >
              <EditIcon />
            </button>

            {/* Delete button - only for regular tasks */}
            {task.type !== "google_calendar" && (
              <button
                onClick={handleDelete}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded transition-all duration-200"
                aria-label="Delete task"
                title="Delete task"
              >
                <CloseIcon />
              </button>
            )}
          </div>

          {/* Show Google Calendar indicator for Google events */}
          {task.type === "google_calendar" && (
            <div className="flex-shrink-0 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
              Google Calendar
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarTaskItem;
