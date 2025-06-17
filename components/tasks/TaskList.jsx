"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import TaskCard from "./TaskCard";
import DeleteCategoryDialog from "./DeleteCategoryDialog";
import AddCategoryDialog from "./AddCategoryDialog";
import { DeleteIcon, EditIcon } from "@/components/ui/Icons";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  setupTasksListener,
  groupTasksByCategory,
  sortTasksByCompletion,
  CATEGORY_COLORS,
  UNCATEGORIZED_COLOR,
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
  const router = useRouter();

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

  // Check if there is at least one undone task (tasks are already filtered by userId in the query)
  const hasUndoneTasks = tasks.some((task) => !task.isDone);

  // Group tasks by category
  const { tasksByCategory, uncategorized } = groupTasksByCategory(
    tasks,
    categories
  );

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
  const hasNoCategories = categories.length === 0 && uncategorized.length === 0;

  // If no categories exist, show centered add category button
  if (hasNoCategories) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Categories Yet
              </h3>
              <p className="text-gray-600 mb-8">
                Get started by creating your first category to organize your
                tasks
              </p>
            </div>
            <button
              onClick={handleAddCategory}
              className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-3 font-medium shadow-lg hover:shadow-xl mx-auto text-lg cursor-pointer"
              aria-label="Add your first category"
            >
              <span className="text-2xl">+</span>
              Create Your First Category
            </button>
          </div>
        </div>

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

  // Create a combined array of categories and uncategorized with the add button positioned correctly
  const allItems = [...categories];
  if (uncategorized.length > 0) {
    allItems.push("uncategorized");
  }

  // Insert the add button at position 3 (4th element) if there are 4+ items, otherwise at the end
  const addButtonPosition = allItems.length >= 4 ? 3 : allItems.length;
  allItems.splice(addButtonPosition, 0, "add-category");

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto mt-8 px-4">
        {hasUndoneTasks && (
          <button
            className="fixed right-8 top-1/2 -translate-y-1/2 z-40 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 transition focus:outline-none cursor-pointer"
            aria-label="Show more"
            onClick={() => router.push("/matrix")}
          >
            <span className="text-2xl">&gt;</span>
          </button>
        )}

        {allItems.map((item, idx) => {
          // Add Category Button
          if (item === "add-category") {
            return (
              <div
                key="add-category"
                className="bg-gray-50 rounded-lg border-t-4 border-dashed border-gray-300 shadow p-4 min-h-[300px] flex items-center justify-center"
              >
                <button
                  onClick={handleAddCategory}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
                  aria-label="Add new category"
                >
                  <span className="text-xl">+</span>
                  Add Category
                </button>
              </div>
            );
          }

          // Uncategorized tasks
          if (item === "uncategorized") {
            return (
              <div
                key="uncategorized"
                className={`bg-gray-50 rounded-lg border-t-4 ${UNCATEGORIZED_COLOR} shadow p-4 min-h-[300px]`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-lg">Uncategorized</span>
                  <span className="text-xs bg-gray-200 rounded px-2 py-0.5">
                    {uncategorized.length}
                  </span>
                </div>
                <div className="space-y-4">
                  <AnimatePresence>
                    {sortTasksByCompletion(uncategorized).map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 40,
                        }}
                      >
                        <TaskCard task={task} onEdit={onEdit} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          }

          // Regular category
          const cat = item;
          const categoryIndex = categories.indexOf(cat);
          return (
            <div
              key={cat}
              className={`bg-gray-50 rounded-lg border-t-4 ${
                CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length]
              } shadow p-4 min-h-[300px]`}
            >
              <div className="flex items-center justify-between mb-2 group">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{cat}</span>
                  <span className="text-xs bg-gray-200 rounded px-2 py-0.5">
                    {tasksByCategory[cat].length}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button
                    onClick={() => handleEditCategory(cat)}
                    className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-100 rounded transition-all duration-200"
                    aria-label={`Edit ${cat} category`}
                    title={`Edit ${cat} category`}
                  >
                    <EditIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded transition-all duration-200"
                    aria-label={`Delete ${cat} category`}
                    title={`Delete ${cat} category`}
                  >
                    <DeleteIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <AnimatePresence>
                  {sortTasksByCompletion(tasksByCategory[cat]).length === 0 ? (
                    <div className="text-center text-gray-400">No tasks</div>
                  ) : (
                    sortTasksByCompletion(tasksByCategory[cat]).map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 40,
                        }}
                      >
                        <TaskCard task={task} onEdit={onEdit} />
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

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
