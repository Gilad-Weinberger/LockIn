import { LockIcon, UnlockIcon } from "./TaskFormIcons";

const TaskFormSettings = ({
  isDone,
  setIsDone,
  taskType,
  aiScheduleLocked,
  setAiScheduleLocked,
  category,
  setCategory,
  categories,
  userData,
}) => {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={isDone}
            onChange={(e) => setIsDone(e.target.checked)}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          {taskType === "deadline" ? "Completed" : "Attended"}
        </label>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            AI Schedule:
          </span>
          <button
            type="button"
            onClick={() => setAiScheduleLocked(!aiScheduleLocked)}
            className={`p-1.5 rounded-md transition-colors ${
              aiScheduleLocked
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "bg-green-100 text-green-600 hover:bg-green-200"
            }`}
            title={
              aiScheduleLocked
                ? "Locked from AI scheduling"
                : "Unlocked for AI scheduling"
            }
          >
            {aiScheduleLocked ? <LockIcon /> : <UnlockIcon />}
          </button>
        </div>
      </div>

      {!userData ? (
        <div className="text-sm text-gray-500">
          Loading categories...
        </div>
      ) : categories.length > 0 ? (
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="" disabled>
            Select Category
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      ) : (
        <div className="text-sm text-gray-500">
          No categories found in your profile.
        </div>
      )}
    </>
  );
};

export default TaskFormSettings; 