import { useRouter } from "next/navigation";
import TaskCategory from "./TaskCategory";
import AddCategoryCard from "./AddCategoryCard";
import { groupTasksByCategory } from "@/lib/functions/taskFunctions";

const TaskListGrid = ({
  tasks,
  categories,
  onEdit,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  dragProps,
  getAnimationValues,
}) => {
  const router = useRouter();
  const { tasksByCategory, uncategorized } = groupTasksByCategory(
    tasks,
    categories
  );

  // Check if there is at least one undone task
  const hasUndoneTasks = tasks.some((task) => !task.isDone);

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
              <AddCategoryCard
                key="add-category"
                onAddCategory={onAddCategory}
              />
            );
          }

          // Uncategorized tasks
          if (item === "uncategorized") {
            return (
              <TaskCategory
                key="uncategorized"
                categoryName="uncategorized"
                tasks={uncategorized}
                categories={categories}
                isUncategorized={true}
                dragOverCategory={dragProps.dragOverCategory}
                onDragOver={dragProps.handleDragOver}
                onDragEnter={dragProps.handleDragEnter}
                onDragLeave={dragProps.handleDragLeave}
                onDrop={dragProps.handleDrop}
                onEdit={onEdit}
                onEditCategory={onEditCategory}
                onDeleteCategory={onDeleteCategory}
                onDragStart={dragProps.handleDragStart}
                onDragEnd={dragProps.handleDragEnd}
                getAnimationValues={getAnimationValues}
              />
            );
          }

          // Regular category
          const categoryName = item;
          return (
            <TaskCategory
              key={categoryName}
              categoryName={categoryName}
              tasks={tasksByCategory[categoryName] || []}
              categories={categories}
              isUncategorized={false}
              dragOverCategory={dragProps.dragOverCategory}
              onDragOver={dragProps.handleDragOver}
              onDragEnter={dragProps.handleDragEnter}
              onDragLeave={dragProps.handleDragLeave}
              onDrop={dragProps.handleDrop}
              onEdit={onEdit}
              onEditCategory={onEditCategory}
              onDeleteCategory={onDeleteCategory}
              onDragStart={dragProps.handleDragStart}
              onDragEnd={dragProps.handleDragEnd}
              getAnimationValues={getAnimationValues}
            />
          );
        })}
      </div>
    </>
  );
};

export default TaskListGrid;
