"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import CalendarTaskForm from "./CalendarTaskForm";
import {
  WeekViewHeader,
  WeekViewAllDaySection,
  WeekViewTimeGrid,
  WeekViewTaskEvents,
  generateWeekData,
  calculateAllDayHeight,
} from "./weekView";

const CalendarWeekView = ({ currentDate, tasks, onDateClick }) => {
  const [editingTask, setEditingTask] = useState(null);
  const { userData } = useAuth();
  const categories = userData?.categories || [];

  // Generate week data
  const weekData = useMemo(() => generateWeekData(currentDate), [currentDate]);

  // Calculate dynamic all-day section height
  const allDayHeight = useMemo(
    () => calculateAllDayHeight(weekData.days, tasks),
    [weekData.days, tasks]
  );

  const handleTaskClick = (task) => {
    setEditingTask(task);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header with days */}
      <WeekViewHeader weekDays={weekData.days} onDateClick={onDateClick} />

      {/* All-day events section */}
      <WeekViewAllDaySection
        weekDays={weekData.days}
        tasks={tasks}
        categories={categories}
        allDayHeight={allDayHeight}
        onTaskClick={handleTaskClick}
      />

      {/* Calendar body with time slots - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <style jsx>{`
          .scrollbar-hide {
            -webkit-overflow-scrolling: touch;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Time grid background */}
        <WeekViewTimeGrid weekDays={weekData.days} onDateClick={onDateClick} />

        {/* Positioned task events */}
        <WeekViewTaskEvents
          weekDays={weekData.days}
          tasks={tasks}
          categories={categories}
          onTaskClick={handleTaskClick}
        />
      </div>

      {/* Edit Task Modal */}
      <CalendarTaskForm
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        task={editingTask}
      />
    </div>
  );
};

export default CalendarWeekView;
