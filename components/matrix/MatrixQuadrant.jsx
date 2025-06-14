"use client";

import { useState, useCallback, useMemo } from "react";
import MatrixTaskList from "./MatrixTaskList";
import EmptyQuadrant from "./EmptyQuadrant";
import {
  updateTaskPriority,
  reorderTasksInQuadrant,
} from "@/lib/functions/taskFunctions";

const MatrixQuadrant = ({
  title,
  description,
  bgColor,
  borderColor,
  accentColor,
  tasks,
  emptyMessage,
  quadrantType,
  onTaskMove,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  // Memoize filtered tasks to avoid recomputation
  const quadrantTasks = useMemo(
    () => tasks.filter((task) => task.priority === quadrantType),
    [tasks, quadrantType]
  );

  // Optimized drag handlers with useCallback to prevent re-renders
  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault();
      if (!isDragOver) setIsDragOver(true);
    },
    [isDragOver]
  );

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      setIsDragOver(false);

      const taskData = JSON.parse(e.dataTransfer.getData("text/plain"));
      const dropIndex = e.dataTransfer.getData("application/drop-index");

      // Don't do anything if dropping in the same position
      if (taskData.priority === quadrantType && !dropIndex) {
        return;
      }

      try {
        let newInGroupRank = quadrantTasks.length + 1; // Add to end by default

        if (dropIndex && taskData.priority === quadrantType) {
          // Reordering within the same quadrant
          newInGroupRank = parseInt(dropIndex);
          await reorderTasksInQuadrant(
            taskData.id,
            newInGroupRank,
            quadrantTasks,
            quadrantType
          );
        } else {
          // Moving to a different quadrant
          // Set inGroupRank based on quadrant type
          if (quadrantType === "do" || quadrantType === "plan") {
            newInGroupRank = quadrantTasks.length + 1;
          } else {
            newInGroupRank = 1; // For delegate and delete, order doesn't matter as much
          }

          await updateTaskPriority(taskData.id, quadrantType, newInGroupRank);
        }

        // Optimistic update - call onTaskMove immediately
        if (onTaskMove) {
          onTaskMove(taskData.id, quadrantType, newInGroupRank);
        }
      } catch (error) {
        console.error("Error updating task:", error);
      }
    },
    [quadrantType, quadrantTasks, onTaskMove]
  );

  const handleTaskDragStart = useCallback((e, task, index) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(task));
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleTaskDrop = useCallback(
    async (e, dropIndex) => {
      e.preventDefault();
      e.stopPropagation();

      const taskData = JSON.parse(e.dataTransfer.getData("text/plain"));

      // Only handle reordering within the same quadrant
      if (taskData.priority === quadrantType) {
        try {
          await reorderTasksInQuadrant(
            taskData.id,
            dropIndex,
            quadrantTasks,
            quadrantType
          );

          if (onTaskMove) {
            onTaskMove(taskData.id, quadrantType, dropIndex);
          }
        } catch (error) {
          console.error("Error reordering task:", error);
        }
      }
    },
    [quadrantType, quadrantTasks, onTaskMove]
  );

  return (
    <div
      className={`${bgColor} border ${borderColor} p-4 flex flex-col transition-all duration-200 ${
        isDragOver ? "ring-2 ring-blue-400 ring-opacity-50" : ""
      } ${
        quadrantType === "delegate" || quadrantType === "delete"
          ? "pt-12"
          : "pb-12"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex-1 space-y-3 overflow-y-auto">
        {tasks.length > 0 ? (
          <MatrixTaskList
            tasks={tasks}
            quadrantType={quadrantType}
            accentColor={accentColor}
            onTaskDragStart={handleTaskDragStart}
            onTaskDrop={handleTaskDrop}
          />
        ) : (
          <EmptyQuadrant emptyMessage={emptyMessage} />
        )}
      </div>
    </div>
  );
};

export default MatrixQuadrant;
