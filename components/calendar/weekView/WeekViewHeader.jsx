"use client";

import { GRID_STYLE, WEEKDAYS, isToday } from "./WeekViewUtils";

const WeekViewHeader = ({ weekDays, onDateClick }) => {
  return (
    <div className="border-b bg-gray-50 flex-shrink-0" style={GRID_STYLE}>
      {/* Time column header */}
      <div className="px-4 py-3 text-sm font-semibold text-gray-700 border-r">
        Time
      </div>

      {/* Day headers */}
      {weekDays.map((date, index) => {
        const isTodayDate = isToday(date);
        return (
          <div
            key={index}
            className={`px-4 py-3 text-center border-r last:border-r-0 cursor-pointer hover:bg-gray-100 transition-colors ${
              isTodayDate ? "bg-blue-50" : ""
            }`}
            onClick={() => onDateClick(date)}
          >
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              {WEEKDAYS[index]}
            </div>
            <div
              className={`text-lg font-semibold mt-1 ${
                isTodayDate
                  ? "bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto"
                  : "text-gray-900"
              }`}
            >
              {date.getDate()}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekViewHeader;
