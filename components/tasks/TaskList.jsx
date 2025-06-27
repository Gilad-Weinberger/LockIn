"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DeleteCategoryDialog from "./DeleteCategoryDialog";
import AddCategoryDialog from "./AddCategoryDialog";
import {
  TaskListGrid,
  TaskListEmptyState,
  useDragAndDrop,
  useTaskAnimations,
} from "./taskList";
import {
  setupTasksListener,
  groupTasksByCategory,
} from "@/lib/functions/taskFunctions";
import {
  deleteCategory,
  addCategory,
  editCategory,
} from "@/lib/functions/userFunctions";

const TaskList = ({ onEdit }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    categoryName: "",
    taskCount: 0,
  });
  const [addDialog, setAddDialog] = useState({
    isOpen: false,
    isEdit: false,
    categoryName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const { userData, user, refreshUserData } = useAuth();
  const categories = userData?.categories || [];

  // Custom hooks for animations and drag-and-drop
  const {
    taskAnimationDirections,
    setTaskAnimationDirections,
    getAnimationValues,
  } = useTaskAnimations();
  const dragProps = useDragAndDrop(
    tasks,
    setTasks,
    categories,
    setTaskAnimationDirections
  );

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError("");

    const unsubscribe = setupTasksListener(user.uid, ({ tasks, error }) => {
      if (error) {
        setHasError(error);
      } else {
        setTasks(tasks);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Category management handlers

  const handleDeleteCategory = (categoryName) => {
    const taskCount = tasksByCategory[categoryName]?.length || 0;
    setDeleteDialog({
      isOpen: true,
      categoryName,
      taskCount,
    });
  };

  const handleEditCategory = (categoryName) => {
    setAddDialog({
      isOpen: true,
      isEdit: true,
      categoryName,
    });
  };

  const confirmDeleteCategory = async () => {
    if (!user || !deleteDialog.categoryName) return;

    setIsDeleting(true);
    try {
      await deleteCategory(user.uid, deleteDialog.categoryName, categories);
      await refreshUserData(); // Refresh user data to get updated categories
      setDeleteDialog({ isOpen: false, categoryName: "", taskCount: 0 });
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Failed to delete category. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteCategory = () => {
    setDeleteDialog({ isOpen: false, categoryName: "", taskCount: 0 });
  };

  const handleAddCategory = () => {
    setAddDialog({
      isOpen: true,
      isEdit: false,
      categoryName: "",
    });
  };

  const confirmAddOrEditCategory = async (categoryName) => {
    if (!user || !categoryName) return;

    setIsAdding(true);
    try {
      if (addDialog.isEdit) {
        // Edit existing category
        await editCategory(
          user.uid,
          addDialog.categoryName,
          categoryName,
          categories
        );
      } else {
        // Add new category
        await addCategory(user.uid, categoryName, categories);
      }
      await refreshUserData(); // Refresh user data to get updated categories
      setAddDialog({ isOpen: false, isEdit: false, categoryName: "" });
    } catch (error) {
      console.error(
        `Failed to ${addDialog.isEdit ? "edit" : "add"} category:`,
        error
      );
      alert(
        error.message ||
          `Failed to ${
            addDialog.isEdit ? "edit" : "add"
          } category. Please try again.`
      );
    } finally {
      setIsAdding(false);
    }
  };

  const cancelAddOrEditCategory = () => {
    setAddDialog({ isOpen: false, isEdit: false, categoryName: "" });
  };

  if (isLoading)
    return <div className="text-center py-8">Loading tasks...</div>;
  if (hasError)
    return <div className="text-center text-red-500 py-8">{hasError}</div>;

  // Check if there are no categories and no uncategorized tasks
  const { tasksByCategory, uncategorized } = groupTasksByCategory(
    tasks,
    categories
  );
  const hasNoCategories = categories.length === 0 && uncategorized.length === 0;

  // If no categories exist, show centered add category button
  if (hasNoCategories) {
    return (
      <>
        <TaskListEmptyState onAddCategory={handleAddCategory} />
        <AddCategoryDialog
          isOpen={addDialog.isOpen}
          isEdit={addDialog.isEdit}
          initialCategoryName={addDialog.categoryName}
          onConfirm={confirmAddOrEditCategory}
          onCancel={cancelAddOrEditCategory}
          isAdding={isAdding}
        />
      </>
    );
  }

  return (
    <>
      <TaskListGrid
        tasks={tasks}
        categories={categories}
        onEdit={onEdit}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
        dragProps={dragProps}
        getAnimationValues={getAnimationValues}
      />

      <DeleteCategoryDialog
        isOpen={deleteDialog.isOpen}
        categoryName={deleteDialog.categoryName}
        taskCount={deleteDialog.taskCount}
        onConfirm={confirmDeleteCategory}
        onCancel={cancelDeleteCategory}
        isDeleting={isDeleting}
      />

      <AddCategoryDialog
        isOpen={addDialog.isOpen}
        isEdit={addDialog.isEdit}
        initialCategoryName={addDialog.categoryName}
        onConfirm={confirmAddOrEditCategory}
        onCancel={cancelAddOrEditCategory}
        isAdding={isAdding}
      />
    </>
  );
};

export default TaskList;
