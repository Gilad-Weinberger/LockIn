import { useState } from "react";
import { updateTask } from "@/lib/functions/taskFunctions";

export const useDragAndDrop = (
  tasks,
  setTasks,
  categories,
  setTaskAnimationDirections
) => {
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverCategory, setDragOverCategory] = useState(null);

  // Helper function to get category position index
  const getCategoryPosition = (categoryName) => {
    if (categoryName === "uncategorized" || !categoryName) {
      return categories.length;
    }
    return categories.indexOf(categoryName);
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverCategory(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (categoryName) => {
    setDragOverCategory(categoryName);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverCategory(null);
    }
  };

  const handleDrop = async (e, targetCategory) => {
    e.preventDefault();

    const taskId = e.dataTransfer.getData("text/plain");
    const draggedTaskData =
      draggedTask || tasks.find((task) => task.id === taskId);

    if (!draggedTaskData) {
      console.error("Could not find dragged task");
      return;
    }

    const currentCategory = draggedTaskData.category || "uncategorized";
    if (currentCategory === targetCategory) {
      setDraggedTask(null);
      setDragOverCategory(null);
      return;
    }

    // Calculate animation direction based on category positions
    const sourcePosition = getCategoryPosition(currentCategory);
    const targetPosition = getCategoryPosition(targetCategory);
    const movingRight = targetPosition > sourcePosition;

    // Store animation direction for this task
    setTaskAnimationDirections((prev) => ({
      ...prev,
      [draggedTaskData.id]: movingRight ? "from-left" : "from-right",
    }));

    // Optimistic update
    const newCategory =
      targetCategory === "uncategorized" ? "" : targetCategory;
    const optimisticTasks = tasks.map((task) =>
      task.id === draggedTaskData.id ? { ...task, category: newCategory } : task
    );

    setTasks(optimisticTasks);
    setDraggedTask(null);
    setDragOverCategory(null);

    // Clear animation direction after animation completes
    setTimeout(() => {
      setTaskAnimationDirections((prev) => {
        const newDirections = { ...prev };
        delete newDirections[draggedTaskData.id];
        return newDirections;
      });
    }, 600);

    try {
      await updateTask(draggedTaskData.id, { category: newCategory });
      console.log(
        `✅ Moved task "${draggedTaskData.title}" from "${currentCategory}" to "${targetCategory}"`
      );
    } catch (error) {
      console.error("Failed to move task:", error);
      setTasks(tasks);
      setTaskAnimationDirections((prev) => {
        const newDirections = { ...prev };
        delete newDirections[draggedTaskData.id];
        return newDirections;
      });
      alert("Failed to move task. Please try again.");
    }
  };

  return {
    draggedTask,
    dragOverCategory,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  };
};
