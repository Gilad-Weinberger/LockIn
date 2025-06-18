"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  updateTask,
  updateNullPriorityTasks,
} from "@/lib/functions/taskFunctions";

const CalendarTaskForm = ({ open, onClose, task }) => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState("");
  const [taskType, setTaskType] = useState("deadline");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [aiScheduleLocked, setAiScheduleLocked] = useState(false);
  const { userData } = useAuth();
  const categories = userData?.categories || [];

  // Initialize form with task data
  useEffect(() => {
    if (task && open) {
      setTitle(task.title || "");
      setCategory(task.category || "");
      setTaskType(task.type || "deadline");
      setIsDone(typeof task.isDone === "boolean" ? task.isDone : false);
      setAiScheduleLocked(
        typeof task.aiScheduleLocked === "boolean"
          ? task.aiScheduleLocked
          : false
      );

      // Handle startDate and endDate
      if (task.startDate) {
        const startDateObj = task.startDate.toDate
          ? task.startDate.toDate()
          : new Date(task.startDate);
        setStartDate(startDateObj.toISOString().split("T")[0]);
        setStartTime(startDateObj.toTimeString().slice(0, 5));
      }

      if (task.endDate) {
        const endDateObj = task.endDate.toDate
          ? task.endDate.toDate()
          : new Date(task.endDate);
        setEndDate(endDateObj.toISOString().split("T")[0]);
        setEndTime(endDateObj.toTimeString().slice(0, 5));
      }
    } else if (!task) {
      // Reset form for new tasks
      setTitle("");
      setStartDate("");
      setEndDate("");
      setStartTime("");
      setEndTime("");
      setCategory("");
      setTaskType("deadline");
      setIsDone(false);
      setAiScheduleLocked(false);
    }
  }, [task, open]);

  // Don't render if modal is not open
  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setHasError("");

    try {
      // Combine date and time for startDate and endDate
      const startDateTime = new Date(`${startDate}T${startTime || "00:00"}`);
      const endDateTime = new Date(`${endDate}T${endTime || "23:59"}`);

      const taskData = {
        title,
        startDate: startDateTime,
        endDate: endDateTime,
        category,
        type: taskType,
        isDone,
        aiScheduleLocked,
      };

      // If task has null priority, set it to "plan" priority
      if (task && (task.priority === null || task.priority === undefined)) {
        taskData.priority = "plan";
        // inGroupRank will be handled by updateNullPriorityTasks if needed
      }

      if (task) {
        await updateTask(task.id, taskData);
      }

      // Check if we need to update null priority tasks for this user
      if (userData?.uid) {
        try {
          await updateNullPriorityTasks(userData.uid);
        } catch (updateError) {
          console.error(
            "Error updating null priority tasks after task update:",
            updateError
          );
          // Don't fail the entire operation
        }
      }

      onClose();
    } catch (err) {
      setHasError("Failed to update task");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="relative bg-white rounded-lg w-full max-w-md p-8 outline outline-2 outline-gray-300">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-1 right-3 text-gray-400 hover:text-gray-700 text-3xl font-bold focus:outline-none cursor-pointer"
          aria-label="Close"
        >
          ×
        </button>
        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="text-xl font-bold mb-4">Edit Scheduled Task</h2>

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

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
            <div className="text-sm text-gray-500">Loading categories...</div>
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

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !userData || categories.length === 0}
          >
            {isLoading ? "Saving..." : !userData ? "Loading..." : "Save Task"}
          </button>
          {hasError && <p className="text-red-500 text-sm">{hasError}</p>}
        </form>
      </div>
    </div>
  );
};

// Lock/Unlock Icons
const LockIcon = () => (
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
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
    />
  </svg>
);

const UnlockIcon = () => (
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
      d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
    />
  </svg>
);

export default CalendarTaskForm;
