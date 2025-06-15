"use client";

import { useState, useEffect } from "react";

const AddCategoryDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  isAdding,
  isEdit = false,
  initialCategoryName = "",
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState("");

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setCategoryName(isEdit ? initialCategoryName : "");
      setError("");
    }
  }, [isOpen, isEdit, initialCategoryName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const trimmedName = categoryName.trim();

    if (!trimmedName) {
      setError("Category name cannot be empty");
      return;
    }

    if (trimmedName.length > 50) {
      setError("Category name must be less than 50 characters");
      return;
    }

    onConfirm(trimmedName);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleInputChange = (e) => {
    setCategoryName(e.target.value);
    if (error) setError(""); // Clear error when user starts typing
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {isEdit ? "Edit Category" : "Add New Category"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="categoryName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Category Name
            </label>
            <input
              id="categoryName"
              type="text"
              value={categoryName}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter category name"
              disabled={isAdding}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isAdding}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding || !categoryName.trim()}
              className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isEdit
                  ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                  : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
              }`}
            >
              {isAdding
                ? isEdit
                  ? "Updating..."
                  : "Adding..."
                : isEdit
                ? "Update Category"
                : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryDialog;
