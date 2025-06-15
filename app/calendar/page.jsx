"use client";

import { useState, useEffect } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/context/AuthContext";
import { scheduleTasks } from "@/lib/functions/taskFunctions";
import {
  CalendarHeader,
  CalendarMonthView,
  CalendarWeekView,
  CalendarLoadingState,
  CalendarEventModal,
} from "@/components/calendar";
import { NavigationButton } from "@/components/ui/Icons";
import PageLayout from "@/components/ui/PageLayout";

const CalendarPage = () => {
  const { tasks: allTasks, isLoading, hasError } = useTasks();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // 'month' or 'week'
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState("");

  // Filter tasks to only show scheduled ones (those with startDate and endDate)
  const scheduledTasks = allTasks.filter(
    (task) => task.startDate && task.endDate
  );

  // Helper function to check if a task is a future task
  const isFutureTask = (task) => {
    if (!task.taskDate) return false;
    const taskDate = new Date(task.taskDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today
    return taskDate >= today;
  };

  // Auto-schedule only future tasks when page loads or tasks change
  useEffect(() => {
    const scheduleTasksAuto = async () => {
      if (!user || isLoading || isScheduling) return;

      // Check if there are future tasks that need scheduling
      const futureUnscheduledTasks = allTasks.filter(
        (task) =>
          !task.isDone &&
          (!task.startDate || !task.endDate) &&
          isFutureTask(task)
      );

      // Also check for future tasks with updated prioritization
      const futureTasksNeedingRescheduling = allTasks.filter((task) => {
        if (task.isDone) return false;
        if (!task.startDate || !task.endDate) return false;
        if (!task.prioritizedAt || !task.scheduledAt) return false;
        if (!isFutureTask(task)) return false;

        const prioritizedTime = new Date(task.prioritizedAt);
        const scheduledTime = new Date(task.scheduledAt);
        return prioritizedTime > scheduledTime;
      });

      if (
        futureUnscheduledTasks.length === 0 &&
        futureTasksNeedingRescheduling.length === 0
      ) {
        return;
      }

      console.log(
        `Auto-scheduling future tasks: ${futureUnscheduledTasks.length} unscheduled, ${futureTasksNeedingRescheduling.length} need rescheduling`
      );

      setIsScheduling(true);
      setScheduleError("");

      try {
        const result = await scheduleTasks(user.uid);
        console.log("Auto-scheduling result:", result);
      } catch (error) {
        console.error("Auto-scheduling error:", error);
        setScheduleError(error.message);
      } finally {
        setIsScheduling(false);
      }
    };

    // Debounce the scheduling to avoid excessive API calls
    const timeoutId = setTimeout(scheduleTasksAuto, 1000);
    return () => clearTimeout(timeoutId);
  }, [user, allTasks, isLoading]);

  // Manual scheduling function for all future tasks (triggered by button)
  const handleManualSchedule = async () => {
    if (!user || isScheduling) return;

    setIsScheduling(true);
    setScheduleError("");

    try {
      // Force reschedule all tasks when manually triggered
      const result = await scheduleTasks(user.uid, true);
      console.log("Manual scheduling result:", result);
    } catch (error) {
      console.error("Manual scheduling error:", error);
      setScheduleError(error.message);
    } finally {
      setIsScheduling(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "t") {
        handleToday();
      } else if (e.key === "m") {
        setView("month");
      } else if (e.key === "w") {
        setView("week");
      } else if (e.key === "Escape") {
        setIsModalOpen(false);
      } else if (e.key === "s" && e.ctrlKey) {
        e.preventDefault();
        handleManualSchedule();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <PageLayout>
        <CalendarLoadingState />
      </PageLayout>
    );
  }

  if (hasError) {
    return (
      <PageLayout>
        <div className="h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center text-red-500 py-8">
            <p>Error loading calendar: {hasError}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="h-full bg-gray-100 relative flex flex-col overflow-hidden">
        {/* Navigation buttons */}
        <NavigationButton
          direction="left"
          destination="/matrix"
          position="left"
          ariaLabel="Back to matrix view"
        />

        {/* Scheduling error indicator */}
        {scheduleError && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm max-w-xs">
              Scheduling error: {scheduleError}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col p-4 min-h-0">
          <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
            {/* Calendar container as one block */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden flex-1 flex flex-col min-h-0">
              <CalendarHeader
                currentDate={currentDate}
                view={view}
                onViewChange={setView}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onToday={handleToday}
                onSchedule={handleManualSchedule}
                isScheduling={isScheduling}
              />

              {/* Calendar view without gap */}
              <div className="flex-1 overflow-hidden min-h-0">
                {view === "month" ? (
                  <CalendarMonthView
                    currentDate={currentDate}
                    tasks={scheduledTasks}
                    onDateClick={handleDateClick}
                  />
                ) : (
                  <CalendarWeekView
                    currentDate={currentDate}
                    tasks={scheduledTasks}
                    onDateClick={handleDateClick}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <CalendarEventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedDate={selectedDate}
          tasks={scheduledTasks}
        />
      </div>
    </PageLayout>
  );
};

export default CalendarPage;
