import { AnimatePresence } from "framer-motion";
import TaskCard from "../TaskCard";
import TaskCategoryHeader from "./TaskCategoryHeader";
import TaskAnimationWrapper from "./TaskAnimationWrapper";
import {
  sortTasksByCompletion,
  CATEGORY_COLORS,
  UNCATEGORIZED_COLOR,
} from "@/lib/functions/taskFunctions";

const TaskCategory = ({
  categoryName,
  tasks,
  categories,
  isUncategorized = false,
  dragOverCategory,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onEdit,
  onEditCategory,
  onDeleteCategory,
  onDragStart,
  onDragEnd,
  getAnimationValues,
}) => {
  const categoryIndex = categories.indexOf(categoryName);
  const borderColor = isUncategorized
    ? UNCATEGORIZED_COLOR
    : CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length];

  return (
    <div
      className={`bg-gray-50 rounded-lg border-t-4 ${borderColor} shadow p-4 min-h-[300px] transition-all duration-200 relative ${
        dragOverCategory === categoryName
          ? "ring-2 ring-blue-400 bg-blue-50 transform scale-105"
          : ""
      }`}
      onDragOver={onDragOver}
      onDragEnter={() => onDragEnter(categoryName)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, categoryName)}
    >
      <TaskCategoryHeader
        categoryName={categoryName}
        taskCount={tasks.length}
        onEdit={onEditCategory}
        onDelete={onDeleteCategory}
        isUncategorized={isUncategorized}
      />

      {dragOverCategory === categoryName && (
        <div className="absolute inset-0 bg-blue-200 bg-opacity-20 rounded-lg border-2 border-dashed border-blue-400 flex items-center justify-center">
          <span className="text-blue-600 font-medium">
            Drop task in {isUncategorized ? "Uncategorized" : categoryName}
          </span>
        </div>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {sortTasksByCompletion(tasks).length === 0
            ? !isUncategorized && (
                <div className="text-center text-gray-400">No tasks</div>
              )
            : sortTasksByCompletion(tasks).map((task) => (
                <TaskAnimationWrapper
                  key={task.id}
                  task={task}
                  getAnimationValues={getAnimationValues}
                >
                  <TaskCard
                    task={task}
                    onEdit={onEdit}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                  />
                </TaskAnimationWrapper>
              ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TaskCategory;
