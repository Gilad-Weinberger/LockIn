import { DeleteIcon, EditIcon } from "@/components/ui/Icons";

const TaskCategoryHeader = ({
  categoryName,
  taskCount,
  onEdit,
  onDelete,
  isUncategorized = false,
}) => {
  return (
    <div className="flex items-center justify-between mb-2 group">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-lg">
          {isUncategorized ? "Uncategorized" : categoryName}
        </span>
        <span className="text-xs bg-gray-200 rounded px-2 py-0.5">
          {taskCount}
        </span>
      </div>
      {!isUncategorized && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={() => onEdit(categoryName)}
            className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-100 rounded transition-all duration-200"
            aria-label={`Edit ${categoryName} category`}
            title={`Edit ${categoryName} category`}
          >
            <EditIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(categoryName)}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded transition-all duration-200"
            aria-label={`Delete ${categoryName} category`}
            title={`Delete ${categoryName} category`}
          >
            <DeleteIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCategoryHeader;
