"use client";

import { useAuth } from "@/context/AuthContext";
import {
  TaskFormHeader,
  TaskFormFields,
  TaskFormSettings,
  GoogleCalendarNote,
  TaskFormActions,
  useTaskFormData,
  useTaskFormSubmit,
} from "./taskForm";

const CalendarTaskForm = ({ open, onClose, task }) => {
  const { userData } = useAuth();
  const categories = userData?.categories || [];

  // Use custom hooks for state management and submission
  const formData = useTaskFormData(task, open);
  const { isLoading, hasError, handleSubmit } = useTaskFormSubmit();

  // Don't render if modal is not open
  if (!open) return null;

  const onSubmit = async (e) => {
    e.preventDefault();

    const formValues = {
      title: formData.title,
      startDate: formData.startDate,
      startTime: formData.startTime,
      endDate: formData.endDate,
      endTime: formData.endTime,
      category: formData.category,
      taskType: formData.taskType,
      isDone: formData.isDone,
      aiScheduleLocked: formData.aiScheduleLocked,
    };

    await handleSubmit(
      formValues,
      task,
      formData.isGoogleCalendarEvent,
      onClose
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="relative bg-white rounded-lg w-full max-w-md p-8 outline outline-2 outline-gray-300">
        <form onSubmit={onSubmit} className="space-y-5">
          <TaskFormHeader
            isGoogleCalendarEvent={formData.isGoogleCalendarEvent}
            onClose={onClose}
          />

          <TaskFormFields
            title={formData.title}
            setTitle={formData.setTitle}
            startDate={formData.startDate}
            setStartDate={formData.setStartDate}
            startTime={formData.startTime}
            setStartTime={formData.setStartTime}
            endDate={formData.endDate}
            setEndDate={formData.setEndDate}
            endTime={formData.endTime}
            setEndTime={formData.setEndTime}
          />

          {/* Only show task-specific fields for regular tasks */}
          {!formData.isGoogleCalendarEvent && (
            <TaskFormSettings
              isDone={formData.isDone}
              setIsDone={formData.setIsDone}
              taskType={formData.taskType}
              aiScheduleLocked={formData.aiScheduleLocked}
              setAiScheduleLocked={formData.setAiScheduleLocked}
              category={formData.category}
              setCategory={formData.setCategory}
              categories={categories}
              userData={userData}
            />
          )}

          {/* Show note for Google Calendar events */}
          {formData.isGoogleCalendarEvent && <GoogleCalendarNote />}

          <TaskFormActions
            isLoading={isLoading}
            isGoogleCalendarEvent={formData.isGoogleCalendarEvent}
            userData={userData}
            categories={categories}
            hasError={hasError}
          />
        </form>
      </div>
    </div>
  );
};

export default CalendarTaskForm;
