"use client";

import { useRef, useLayoutEffect, useState as useReactState } from "react";
import {
  deleteTask,
  toggleTaskDone,
  formatDate,
} from "@/lib/functions/taskFunctions";
import {
  EditIcon,
  DeleteIcon,
  CheckIcon,
  ActionButton,
} from "@/components/ui/Icons";

const TaskCard = ({ task, onEdit, onDragStart, onDragEnd }) => {
  const [maxHeight, setMaxHeight] = useReactState("none");
  const [isDragging, setIsDragging] = useReactState(false);
  const cardRef = useRef(null);

  useLayoutEffect(() => {
    if (cardRef.current) {
      if (!task.isDone) {
        setMaxHeight(cardRef.current.scrollHeight + "px");
      } else {
        setMaxHeight("48px"); // Short height for done card
      }
    }
  }, [task.isDone, task.title, task.taskDate, task.category]);

  const handleDelete = async () => {
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

      console.log(`✅ Task "${task.title}" deletion completed`);
    } catch (err) {
      console.error("Failed to delete task:", err);
      alert("Failed to delete task. Please try again.");
    }
  };

  const handleToggleDone = async () => {
    try {
      await toggleTaskDone(task.id, task.isDone);
    } catch (err) {
      alert("Failed to update task status");
    }
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";

    // Create a custom drag image
    const dragImage = cardRef.current.cloneNode(true);
    dragImage.style.opacity = "0.8";
    dragImage.style.transform = "rotate(5deg)";
    dragImage.style.maxHeight = "none";
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);

    // Remove the drag image after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);

    if (onDragStart) {
      onDragStart(task);
    }
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    if (onDragEnd) {
      onDragEnd(task);
    }
  };

  return (
    <div
      ref={cardRef}
      draggable={!task.isDone} // Only allow dragging if task is not done
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        maxHeight,
        overflow: "hidden",
        transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
      }}
      className={`rounded shadow p-3 flex flex-col gap-2 relative group transition-all duration-400 ${
        task.isDone
          ? "bg-green-50 border border-green-300 opacity-80"
          : "bg-white"
      } ${
        isDragging
          ? "opacity-50 transform rotate-2 shadow-lg cursor-grabbing"
          : !task.isDone
          ? "hover:shadow-md cursor-grab"
          : ""
      }`}
    >
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <ActionButton
          variant="edit"
          ariaLabel="Edit task"
          onClick={() => onEdit && onEdit(task)}
        >
          <EditIcon className="h-5 w-5 text-blue-600" />
        </ActionButton>
        <ActionButton
          variant="delete"
          ariaLabel="Delete task"
          onClick={handleDelete}
        >
          <DeleteIcon className="h-5 w-5 text-red-500" />
        </ActionButton>
        <ActionButton
          variant="check"
          className={task.isDone ? "opacity-60" : ""}
          ariaLabel={task.isDone ? "Mark as not done" : "Mark as done"}
          onClick={handleToggleDone}
        >
          <CheckIcon className="h-5 w-5 text-green-600" />
        </ActionButton>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`font-semibold text-base transition-all ${
            task.isDone ? "text-green-700/70" : ""
          }`}
        >
          {task.title}
        </span>
      </div>
      {!task.isDone && (
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <span className="opacity-100">
            {task.type === "event" ? "📅" : "🎯"}
          </span>
          <span>
            {task.type === "event" ? "Date:" : "Due:"}{" "}
            {formatDate(task.taskDate)}
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
