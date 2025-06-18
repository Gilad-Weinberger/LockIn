import { useState, useEffect } from "react";

export const useTaskFormData = (task, open) => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState("");
  const [taskType, setTaskType] = useState("deadline");
  const [isDone, setIsDone] = useState(false);
  const [aiScheduleLocked, setAiScheduleLocked] = useState(false);
  const [isGoogleCalendarEvent, setIsGoogleCalendarEvent] = useState(false);

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

      // Check if this is a Google Calendar event
      const isGoogleEvent = task.type === "google_calendar";
      setIsGoogleCalendarEvent(isGoogleEvent);

      // Handle startDate and endDate for both regular tasks and Google Calendar events
      if (isGoogleEvent) {
        // Google Calendar event
        if (task.start) {
          const startDateObj = new Date(task.start);
          setStartDate(startDateObj.toISOString().split("T")[0]);
          setStartTime(startDateObj.toTimeString().slice(0, 5));
        }
        if (task.end) {
          const endDateObj = new Date(task.end);
          setEndDate(endDateObj.toISOString().split("T")[0]);
          setEndTime(endDateObj.toTimeString().slice(0, 5));
        }
      } else {
        // Regular task
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
      setIsGoogleCalendarEvent(false);
    }
  }, [task, open]);

  return {
    title,
    setTitle,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    category,
    setCategory,
    taskType,
    setTaskType,
    isDone,
    setIsDone,
    aiScheduleLocked,
    setAiScheduleLocked,
    isGoogleCalendarEvent,
    setIsGoogleCalendarEvent,
  };
}; 