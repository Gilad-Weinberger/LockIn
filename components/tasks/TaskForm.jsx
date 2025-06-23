"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  createTask,
  updateTask,
  formatDateTimeLocal,
} from "@/lib/functions/taskFunctions";
import { useGoogleCalendarSync } from "@/hooks/useGoogleCalendarSync";
import {
  createEndDateForEvent,
  formatTaskForGoogleCalendar,
} from "@/lib/utils/google-calendar-sync";

const TaskForm = ({ open, onClose, task }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [taskType, setTaskType] = useState("deadline");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState("");
  const [isDone, setIsDone] = useState(false);
  const { userData, user } = useAuth();
  const categories = userData?.categories || [];
  const titleInputRef = useRef(null);

  const { syncEventToGoogleCalendar, checkGoogleCalendarAccess } =
    useGoogleCalendarSync();

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDate(formatDateTimeLocal(task.taskDate) || "");
      setCategory(task.category || "");
      setTaskType(task.type || "deadline");
      setIsDone(typeof task.isDone === "boolean" ? task.isDone : false);
    } else {
      setTitle("");
      setDate("");
      setCategory("");
      setTaskType("deadline");
      setIsDone(false);
    }
  }, [task, open]);

  // Auto-focus the title input when form opens
  useEffect(() => {
    if (open && titleInputRef.current) {
      // Small delay to ensure the form is fully rendered
      setTimeout(() => {
        titleInputRef.current.focus();
      }, 100);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setHasError("");

    const taskDate = new Date(date);
    const taskData = {
      title,
      taskDate: date,
      category,
      type: taskType,
      isDone,
    };

    // For events, set start and end dates for Google Calendar sync
    if (taskType === "event") {
      taskData.startDate = taskDate;
      taskData.endDate = createEndDateForEvent(taskDate);
    }

    try {
      let taskResult;

      if (task) {
        // Update existing task
        await updateTask(task.id, taskData);
        taskResult = { id: task.id };
      } else {
        // Create new task
        taskResult = await createTask(taskData, user?.uid);
      }

      // If this is an event and Google Calendar sync is available, sync it
      if (
        taskType === "event" &&
        taskData.startDate &&
        taskData.endDate &&
        user?.uid
      ) {
        try {
          const canSync = await checkGoogleCalendarAccess();

          if (canSync) {
            const eventData = formatTaskForGoogleCalendar({
              ...taskData,
              startDate: taskData.startDate,
              endDate: taskData.endDate,
            });

            const syncResult = await syncEventToGoogleCalendar(
              eventData,
              taskResult.id
            );

            if (syncResult.success) {
              console.log(
                `✅ Task "${taskData.title}" synced to Google Calendar`
              );
            } else {
              console.warn(
                `⚠️ Failed to sync task "${taskData.title}" to Google Calendar:`,
                syncResult.error
              );
              // Don't show error to user as the task was still created/updated successfully
            }
          }
        } catch (syncError) {
          console.error(
            "Error attempting to sync to Google Calendar:",
            syncError
          );
          // Don't fail the entire operation if sync fails
        }
      }

      setTitle("");
      setDate("");
      setCategory("");
      setTaskType("deadline");
      onClose();
    } catch (err) {
      setHasError(task ? "Failed to update task" : "Failed to add task");
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
          <h2 className="text-xl font-bold mb-4">
            {task ? "Edit Task" : "Add New Task"}
          </h2>

          {/* Task Type Toggle */}
          <div className="space-y-2">
            <div className="relative bg-gray-100 rounded-lg p-1 flex">
              <button
                type="button"
                onClick={() => setTaskType("deadline")}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  taskType === "deadline"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-800 cursor-pointer"
                }`}
              >
                🎯 Deadline
              </button>
              <button
                type="button"
                onClick={() => setTaskType("event")}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  taskType === "event"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-800 cursor-pointer"
                }`}
              >
                📅 Event
              </button>
            </div>
            {taskType === "event" && (
              <p className="text-xs text-gray-500 text-center">
                Events will automatically sync to Google Calendar if connected
              </p>
            )}
          </div>

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            ref={titleInputRef}
          />
          <input
            type="datetime-local"
            placeholder={
              taskType === "deadline" ? "Due Date & Time" : "Event Date & Time"
            }
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={isDone}
              onChange={(e) => setIsDone(e.target.checked)}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            {taskType === "deadline" ? "Completed" : "Attended"}
          </label>
          {categories.length > 0 ? (
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
            disabled={isLoading || categories.length === 0}
          >
            {isLoading
              ? "Saving..."
              : `Save ${taskType === "deadline" ? "Deadline" : "Event"}`}
          </button>
          {hasError && <p className="text-red-500 text-sm">{hasError}</p>}
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
