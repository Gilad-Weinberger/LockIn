import { ClockIcon, TagIcon, CheckIcon, EditIcon } from "./CalendarIcons";
import { CATEGORY_COLORS } from "@/lib/functions/taskFunctions";

const CalendarTaskItem = ({ task, categories, onEditTask }) => {
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

  const formatTime = (date) => {
    return new Date(
      date.toDate ? date.toDate() : date
    ).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
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
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
            {task.startDate && (
              <span className="flex items-center">
                <ClockIcon />
                <span className="ml-1">
                  {formatTime(task.startDate)}
                  {task.endDate && " - " + formatTime(task.endDate)}
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
            onClick={() => onEditTask(task)}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-100 rounded transition-all duration-200"
            aria-label="Edit task"
            title="Edit task"
          >
            <EditIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarTaskItem; 