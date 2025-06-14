"use client";

const DeleteCategoryDialog = ({
  isOpen,
  categoryName,
  taskCount,
  onConfirm,
  onCancel,
  isDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="relative bg-white rounded-lg w-full max-w-md p-6 outline outline-2 outline-gray-300 shadow-lg">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Delete Category
          </h3>
          <p className="text-gray-600 mb-2">
            Are you sure you want to delete the{" "}
            <strong>"{categoryName}"</strong> category?
          </p>
          <p className="text-sm text-gray-500 mb-6">
            {taskCount > 0
              ? `${taskCount} task${
                  taskCount === 1 ? "" : "s"
                } in this category will be moved to "Uncategorized".`
              : "This action cannot be undone."}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition focus:outline-none"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition focus:outline-none disabled:opacity-50"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Category"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteCategoryDialog;
