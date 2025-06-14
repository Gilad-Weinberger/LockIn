"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import TaskCard from "./TaskCard";
import DeleteCategoryDialog from "./DeleteCategoryDialog";
import { DeleteIcon } from "@/components/ui/Icons";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  setupTasksListener,
  groupTasksByCategory,
  sortTasksByCompletion,
  CATEGORY_COLORS,
  UNCATEGORIZED_COLOR,
} from "@/lib/functions/taskFunctions";
import { deleteCategory } from "@/lib/functions/userFunctions";

const TaskList = ({ onEdit }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    categoryName: "",
    taskCount: 0,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const { userData, user, refreshUserData } = useAuth();
  const categories = userData?.categories || [];
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    setHasError("");

    const unsubscribe = setupTasksListener(({ tasks, error }) => {
      if (error) {
        setHasError(error);
      } else {
        setTasks(tasks);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Only show tasks belonging to the logged-in user
  const userTasks = user
    ? tasks.filter((task) => task.userId === user.uid)
    : [];

  // Check if there is at least one undone task
  const hasUndoneTasks = userTasks.some((task) => !task.isDone);

  // Group tasks by category
  const { tasksByCategory, uncategorized } = groupTasksByCategory(
    userTasks,
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

  if (isLoading)
    return <div className="text-center py-8">Loading tasks...</div>;
  if (hasError)
    return <div className="text-center text-red-500 py-8">{hasError}</div>;

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 max-w-6xl mx-auto mt-8">
        {hasUndoneTasks && (
          <button
            className="fixed right-8 top-1/2 -translate-y-1/2 z-40 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 transition focus:outline-none cursor-pointer"
            aria-label="Show more"
            onClick={() => router.push("/matrix")}
          >
            <span className="text-2xl">&gt;</span>
          </button>
        )}
        {categories.map((cat, idx) => (
          <div
            key={cat}
            className={`flex-1 bg-gray-50 rounded-lg border-t-4 ${
              CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
            } shadow p-4 min-h-[300px]`}
          >
            <div className="flex items-center justify-between mb-2 group">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">{cat}</span>
                <span className="text-xs bg-gray-200 rounded px-2 py-0.5">
                  {tasksByCategory[cat].length}
                </span>
              </div>
              <button
                onClick={() => handleDeleteCategory(cat)}
                className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded transition-all duration-200"
                aria-label={`Delete ${cat} category`}
                title={`Delete ${cat} category`}
              >
                <DeleteIcon className="h-4 w-4" />
              </button>
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
        ))}
        {uncategorized.length > 0 && (
          <div
            className={`flex-1 bg-gray-50 rounded-lg border-t-4 ${UNCATEGORIZED_COLOR} shadow p-4 min-h-[300px]`}
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
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  >
                    <TaskCard task={task} onEdit={onEdit} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      <DeleteCategoryDialog
        isOpen={deleteDialog.isOpen}
        categoryName={deleteDialog.categoryName}
        taskCount={deleteDialog.taskCount}
        onConfirm={confirmDeleteCategory}
        onCancel={cancelDeleteCategory}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default TaskList;
