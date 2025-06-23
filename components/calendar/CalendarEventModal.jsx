"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGoogleCalendarIntegration } from "@/hooks/useGoogleCalendarIntegration";
import { getEventsForCalendarDisplay } from "@/lib/utils/google-calendar-integration";
import CalendarTaskForm from "./CalendarTaskForm";
import CalendarModalHeader from "./eventModal/CalendarModalHeader";
import CalendarModalFooter from "./eventModal/CalendarModalFooter";
import CalendarTaskList from "./eventModal/CalendarTaskList";

const CalendarEventModal = ({ isOpen, onClose, selectedDate, tasks }) => {
  const [editingTask, setEditingTask] = useState(null);
  const { userData } = useAuth();
  const categories = userData?.categories || [];

  // Use our new Google Calendar integration
  const { googleEvents, settings } = useGoogleCalendarIntegration(
    tasks,
    selectedDate,
    "month"
  );

  const dayEvents = useMemo(() => {
    if (!selectedDate) return [];

    const events = getEventsForCalendarDisplay(
      tasks,
      googleEvents,
      selectedDate,
      settings.showGoogleEvents
    );

    // Sort events by start time
    return events.sort((a, b) => {
      // Get start time for comparison
      let aStart, bStart;

      if (a.type === "google_calendar") {
        aStart = a.start ? new Date(a.start) : new Date();
      } else if (a.startDate) {
        aStart = a.startDate.toDate
          ? a.startDate.toDate()
          : new Date(a.startDate);
      } else if (a.time) {
        aStart = new Date(`${selectedDate.toDateString()} ${a.time}`);
      } else {
        aStart = new Date(selectedDate);
      }

      if (b.type === "google_calendar") {
        bStart = b.start ? new Date(b.start) : new Date();
      } else if (b.startDate) {
        bStart = b.startDate.toDate
          ? b.startDate.toDate()
          : new Date(b.startDate);
      } else if (b.time) {
        bStart = new Date(`${selectedDate.toDateString()} ${b.time}`);
      } else {
        bStart = new Date(selectedDate);
      }

      return aStart - bStart;
    });
  }, [selectedDate, tasks, googleEvents, settings.showGoogleEvents]);

  const handleEditTask = (task) => {
    // Allow editing both regular tasks and Google Calendar events
    setEditingTask(task);
  };

  const handleTaskDeleted = (taskId) => {
    // The task will be automatically removed from the list due to the real-time listener
    // We can optionally add any additional cleanup here if needed
    console.log(`Task ${taskId} deleted from calendar modal`);
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
            dayTasks={dayEvents}
            categories={categories}
            onEditTask={handleEditTask}
            onTaskDeleted={handleTaskDeleted}
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
