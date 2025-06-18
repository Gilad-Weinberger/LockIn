"use client";

import { GRID_STYLE, TIME_SLOTS } from "./WeekViewUtils";

const WeekViewTimeGrid = ({ weekDays, onDateClick }) => {
  return (
    <div style={GRID_STYLE}>
      {/* Time slots (background grid) */}
      {TIME_SLOTS.map((hour) => (
        <div key={hour} className="contents">
          {/* Time label */}
          <div className="px-4 py-2 text-xs text-gray-500 border-r border-b border-gray-300 h-[40px] flex items-start">
            {hour === 0
              ? "12 AM"
              : hour < 12
              ? `${hour} AM`
              : hour === 12
              ? "12 PM"
              : `${hour - 12} PM`}
          </div>

          {/* Day columns */}
          {weekDays.map((date, dayIndex) => (
            <div
              key={dayIndex}
              className="border-r last:border-r-0 border-b border-gray-300 h-[40px] cursor-pointer hover:bg-blue-25 transition-colors"
              onClick={() => onDateClick(date)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default WeekViewTimeGrid;
