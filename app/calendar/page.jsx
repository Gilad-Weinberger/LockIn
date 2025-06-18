"use client";

import { useState, useEffect } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/context/AuthContext";
import { scheduleTasks, updateTask } from "@/lib/functions/taskFunctions";
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
  const { user, userData } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // 'month' or 'week'
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState("");

  // Auto-convert tasks with taskDate but no startDate/endDate
  useEffect(() => {
    const convertTaskDatesToScheduled = async () => {
      if (!user || isLoading || !allTasks.length) return;

      const tasksNeedingConversion = allTasks.filter(
        (task) =>
          task.taskDate && (!task.startDate || !task.endDate) && !task.isDone
      );

      if (tasksNeedingConversion.length === 0) return;

      console.log(
        `Converting ${tasksNeedingConversion.length} tasks from taskDate to scheduled format`
      );

      try {
        // Convert tasks one by one to avoid overwhelming the database
        for (const task of tasksNeedingConversion) {
          const taskDate = new Date(task.taskDate);
          const startDate = new Date(taskDate);
          const endDate = new Date(taskDate.getTime() + 60 * 60 * 1000); // Add 1 hour

          await updateTask(task.id, {
            startDate,
            endDate,
          });
        }
      } catch (error) {
        console.error("Error converting task dates:", error);
      }
    };

    const timeoutId = setTimeout(convertTaskDatesToScheduled, 1000);
    return () => clearTimeout(timeoutId);
  }, [user, allTasks.length, isLoading]);

  // Filter tasks to show scheduled ones (those with startDate and endDate)
  const scheduledTasks = allTasks.filter(
    (task) => task.startDate && task.endDate
  );

  // Helper function to check if a task is a future task
  const isFutureTask = (task) => {
    if (!task.taskDate) return false;
    const taskDate = new Date(task.taskDate);
    const now = new Date();
    return taskDate >= now;
  };

  // Auto-schedule only future tasks when page loads or tasks change
  useEffect(() => {
    // Add a ref to track scheduling attempts to prevent excessive calls
    const scheduleTasksAuto = async () => {
      if (
        !user ||
        isLoading ||
        isScheduling ||
        userData?.autoSchedule === false
      )
        return;

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

      const totalTasksNeedingScheduling =
        futureUnscheduledTasks.length + futureTasksNeedingRescheduling.length;

      if (totalTasksNeedingScheduling === 0) {
        console.log("No tasks need auto-scheduling");
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

    // Increase debounce time and only schedule if we have tasks that need it
    const hasTasksNeedingScheduling = allTasks.some(
      (task) =>
        !task.isDone && (!task.startDate || !task.endDate) && isFutureTask(task)
    );

    if (hasTasksNeedingScheduling) {
      const timeoutId = setTimeout(scheduleTasksAuto, 3000); // Increased to 3 seconds
      return () => clearTimeout(timeoutId);
    }
  }, [user, allTasks.length, isLoading, userData?.autoSchedule]); // Added userData?.autoSchedule to dependencies

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
