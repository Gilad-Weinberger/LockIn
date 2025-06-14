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

const TaskCard = ({ task, onEdit }) => {
  const [maxHeight, setMaxHeight] = useReactState("none");
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
    try {
      await deleteTask(task.id);
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  const handleToggleDone = async () => {
    try {
      await toggleTaskDone(task.id, task.isDone);
    } catch (err) {
      alert("Failed to update task status");
    }
  };

  return (
    <div
      ref={cardRef}
      style={{
        maxHeight,
        overflow: "hidden",
        transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
      }}
      className={`rounded shadow p-3 flex flex-col gap-2 relative group transition-all duration-400 ${
        task.isDone
          ? "bg-green-50 border border-green-300 opacity-80"
          : "bg-white"
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
