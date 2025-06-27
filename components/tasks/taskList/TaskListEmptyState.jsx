const TaskListEmptyState = ({ onAddCategory }) => {
  return (
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
            Get started by creating your first category to organize your tasks
          </p>
        </div>
        <button
          onClick={onAddCategory}
          className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-3 font-medium shadow-lg hover:shadow-xl mx-auto text-lg cursor-pointer"
          aria-label="Add your first category"
        >
          <span className="text-2xl">+</span>
          Create Your First Category
        </button>
      </div>
    </div>
  );
};

export default TaskListEmptyState;
