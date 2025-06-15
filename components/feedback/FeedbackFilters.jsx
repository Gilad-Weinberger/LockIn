"use client";

const FeedbackFilters = ({
  activeFilter,
  onFilterChange,
  showHandled,
  onToggleHandled,
  stats = {},
}) => {
  const filters = [
    {
      key: "wanted",
      label: "Wanted",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      key: "recent",
      label: "Recent",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      {/* Show Handled Toggle */}
      <div className="flex items-center space-x-3">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showHandled}
            onChange={(e) => onToggleHandled(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              showHandled
                ? "bg-gradient-to-r from-blue-500 to-blue-600"
                : "bg-gray-300"
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                showHandled ? "transform translate-x-5" : ""
              }`}
            ></div>
          </div>
          <span className="ml-3 text-sm font-medium text-gray-700">
            Show Handled
          </span>
        </label>
        {stats.handled > 0 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
            {stats.handled} handled
          </span>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeFilter === filter.key
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
            }`}
          >
            <span>{filter.label}</span>
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-full ${
                activeFilter === filter.key
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 text-white"
              }`}
            >
              {filter.icon}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FeedbackFilters;
