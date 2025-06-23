"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import CalendarTaskForm from "./CalendarTaskForm";
import CalendarModalHeader from "./eventModal/CalendarModalHeader";
import CalendarModalFooter from "./eventModal/CalendarModalFooter";
import CalendarTaskList from "./eventModal/CalendarTaskList";

const CalendarEventModal = ({
  isOpen,
  onClose,
  selectedDate,
  tasks,
  googleCalendarEvents = [],
  onRefreshGoogleCalendar,
  onRefreshGoogleCalendarSettings,
}) => {
  const [editingTask, setEditingTask] = useState(null);
  const { userData } = useAuth();
  const categories = userData?.categories || [];

  const dayEvents = useMemo(() => {
    if (!selectedDate) return [];

    const events = [];

    // Add regular tasks
    if (tasks && tasks.length > 0) {
      const dayTasks = tasks.filter((task) => {
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
      });

      events.push(...dayTasks.map((task) => ({ ...task, type: "task" })));

      // Get Google Calendar event IDs that are already synced as tasks
      const syncedGoogleEventIds = new Set(
        dayTasks
          .filter((task) => task.googleCalendarEventId)
          .map((task) => task.googleCalendarEventId)
      );

      // Add Google Calendar events (but exclude ones that are already synced as tasks)
      if (googleCalendarEvents && googleCalendarEvents.length > 0) {
        const dayGoogleEvents = googleCalendarEvents.filter((event) => {
          if (!event.start) return false;

          const eventStart = new Date(event.start);
          const eventEnd = event.end ? new Date(event.end) : eventStart;

          // Check if the event occurs on this date
          const selectedDateStart = new Date(selectedDate);
          selectedDateStart.setHours(0, 0, 0, 0);
          const selectedDateEnd = new Date(selectedDate);
          selectedDateEnd.setHours(23, 59, 59, 999);

          return eventStart <= selectedDateEnd && eventEnd >= selectedDateStart;
        });

        // Filter out Google Calendar events that are already synced as tasks
        const uniqueGoogleEvents = dayGoogleEvents.filter(
          (event) => !syncedGoogleEventIds.has(event.id)
        );

        events.push(
          ...uniqueGoogleEvents.map((event) => ({
            ...event,
            type: "google_calendar",
            id: event.id || `google-${Date.now()}-${Math.random()}`,
            title: event.title || event.summary || "Google Calendar Event",
            category: "Google Calendar",
            isDone: false,
          }))
        );
      }
    }

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
  }, [selectedDate, tasks, googleCalendarEvents]);

  const handleEditTask = (task) => {
    // Allow editing both regular tasks and Google Calendar events
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
            dayTasks={dayEvents}
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
        onRefreshGoogleCalendar={onRefreshGoogleCalendar}
        onRefreshGoogleCalendarSettings={onRefreshGoogleCalendarSettings}
      />
    </div>
  );
};

export default CalendarEventModal;
