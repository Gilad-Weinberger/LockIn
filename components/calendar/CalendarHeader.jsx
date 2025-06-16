"use client";

const CalendarHeader = ({
  currentDate,
  view,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
  onSchedule,
  isScheduling = false,
}) => {
  const formatHeaderDate = () => {
    const options = { year: "numeric", month: "long" };
    if (view === "week") {
      const startOfWeek = new Date(currentDate);
      const endOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${startOfWeek.toLocaleDateString(
          "en-US",
          { month: "long", year: "numeric" }
        )}`;
      } else {
        return `${startOfWeek.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} - ${endOfWeek.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
      }
    }
    return currentDate.toLocaleDateString("en-US", options);
  };

  const isShowingToday = () => {
    const today = new Date();

    if (view === "month") {
      return (
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear()
      );
    } else {
      // For week view, check if today falls within the current week
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0); // Normalize to midnight

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999); // End of day

      const todayNormalized = new Date(today);
      todayNormalized.setHours(0, 0, 0, 0); // Normalize to midnight

      return todayNormalized >= startOfWeek && todayNormalized <= endOfWeek;
    }
  };

  return (
    <div className="p-6 border-b">
      <div className="flex items-center justify-between">
        {/* Left section - Date navigation */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToday}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-200 ${
              isShowingToday()
                ? "bg-white text-blue-600 shadow-sm border border-gray-200"
                : "text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer"
            }`}
          >
            Today
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={onPrevious}
              className="p-2 rounded-lg hover:bg-gray-100 transition duration-200"
              aria-label="Previous"
            >
              <ChevronLeftIcon />
            </button>
            <button
              onClick={onNext}
              className="p-2 rounded-lg hover:bg-gray-100 transition duration-200"
              aria-label="Next"
            >
              <ChevronRightIcon />
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {formatHeaderDate()}
          </h1>
        </div>

        {/* Right section - View toggle and Schedule button */}
        <div className="flex items-center space-x-4">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => onViewChange("month")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition duration-200 ${
                view === "month"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-700 hover:text-gray-900 cursor-pointer"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => onViewChange("week")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition duration-200 ${
                view === "week"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-700 hover:text-gray-900 cursor-pointer"
              }`}
            >
              Week
            </button>
          </div>

          {/* Schedule button */}
          {onSchedule && (
            <button
              onClick={onSchedule}
              disabled={isScheduling}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-200 flex items-center gap-2 ${
                isScheduling
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isScheduling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Scheduling...
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Schedule
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ChevronLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
    />
  </svg>
);

export default CalendarHeader;
