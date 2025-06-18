"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import CalendarTaskForm from "./CalendarTaskForm";
import CalendarModalHeader from "./eventModal/CalendarModalHeader";
import CalendarModalFooter from "./eventModal/CalendarModalFooter";
import CalendarTaskList from "./eventModal/CalendarTaskList";

const CalendarEventModal = ({ isOpen, onClose, selectedDate, tasks }) => {
  const [editingTask, setEditingTask] = useState(null);
  const { userData } = useAuth();
  const categories = userData?.categories || [];

  const dayTasks = useMemo(() => {
    if (!selectedDate || !tasks || tasks.length === 0) return [];

    return tasks
      .filter((task) => {
        // For scheduled tasks, check if the date falls within startDate and endDate range
        if (task.startDate && task.endDate) {
          const startDate = task.startDate.toDate
            ? task.startDate.toDate()
            : new Date(task.startDate);
          const endDate = task.endDate.toDate
            ? task.endDate.toDate()
            : new Date(task.endDate);

          // Check if the selected date falls within the task's time range
          const selectedDateStart = new Date(selectedDate);
          selectedDateStart.setHours(0, 0, 0, 0);
          const selectedDateEnd = new Date(selectedDate);
          selectedDateEnd.setHours(23, 59, 59, 999);

          return startDate <= selectedDateEnd && endDate >= selectedDateStart;
        }

        // Fallback to taskDate for backward compatibility (now handles full timestamps)
        if (!task.taskDate) return false;
        const taskDate = new Date(task.taskDate);
        return (
          taskDate.getDate() === selectedDate.getDate() &&
          taskDate.getMonth() === selectedDate.getMonth() &&
          taskDate.getFullYear() === selectedDate.getFullYear()
        );
      })
      .sort((a, b) => {
        // Sort by start time for scheduled tasks
        if (a.startDate && b.startDate) {
          const aStart = a.startDate.toDate
            ? a.startDate.toDate()
            : new Date(a.startDate);
          const bStart = b.startDate.toDate
            ? b.startDate.toDate()
            : new Date(b.startDate);
          return aStart - bStart;
        }

        // Sort by time if available, otherwise by priority
        if (a.time && b.time) return a.time.localeCompare(b.time);
        if (a.time && !b.time) return -1;
        if (!a.time && b.time) return 1;

        const priorityOrder = { do: 0, plan: 1, delegate: 2, delete: 3 };
        return (
          (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
        );
      });
  }, [selectedDate, tasks]);

  const handleEditTask = (task) => {
    setEditingTask(task);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Modal header */}
        <CalendarModalHeader selectedDate={selectedDate} onClose={onClose} />

        {/* Modal body */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          <CalendarTaskList
            dayTasks={dayTasks}
            categories={categories}
            onEditTask={handleEditTask}
          />
        </div>

        {/* Modal footer */}
        <CalendarModalFooter onClose={onClose} />
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

export default CalendarEventModal; 