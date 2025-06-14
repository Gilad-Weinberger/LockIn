"use client";
import { formatDate } from "@/lib/functions/taskFunctions";

const MatrixTaskCard = ({
  task,
  index,
  quadrantType,
  accentColor,
  onDragStart,
}) => {
  const handleDragStart = (e) => {
    onDragStart(e, task, index);
  };

  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      className={`bg-white p-2 rounded shadow border-l-2 relative cursor-move hover:shadow-lg transition-all duration-200 group ${accentColor}`}
    >
      {/* Task type icon in right-center */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
        <span className="text-sm opacity-70">
          {task.type === "event" ? "📅" : "🎯"}
        </span>
      </div>

      <h3 className="font-semibold text-xs pr-8">{task.title}</h3>
      <span className="text-xs text-gray-500">
        {task.type === "event" ? "Date:" : "Due:"}{" "}
        {formatDate(task.taskDate) || "-"}
      </span>
    </div>
  );
};

export default MatrixTaskCard;
