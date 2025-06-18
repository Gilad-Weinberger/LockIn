"use client";

import { useState, useEffect } from "react";
import { scheduleTasks } from "@/lib/functions/taskFunctions";

const CalendarScheduler = ({
  user,
  userData,
  allTasks,
  isLoading,
  onScheduleStart,
  onScheduleEnd,
  onScheduleError,
}) => {
  const [isScheduling, setIsScheduling] = useState(false);

  // Helper function to check if a task is a future task
  const isFutureTask = (task) => {
    if (!task.taskDate) return false;
    const taskDate = new Date(task.taskDate);
    const now = new Date();
    return taskDate >= now;
  };

  // Auto-schedule only future tasks when page loads or tasks change
  useEffect(() => {
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
      onScheduleStart?.();

      try {
        const result = await scheduleTasks(user.uid);
        console.log("Auto-scheduling result:", result);
      } catch (error) {
        console.error("Auto-scheduling error:", error);
        onScheduleError?.(error.message);
      } finally {
        setIsScheduling(false);
        onScheduleEnd?.();
      }
    };

    // Increase debounce time and only schedule if we have tasks that need it
    const hasTasksNeedingScheduling = allTasks.some(
      (task) =>
        !task.isDone && (!task.startDate || !task.endDate) && isFutureTask(task)
    );

    if (hasTasksNeedingScheduling) {
      const timeoutId = setTimeout(scheduleTasksAuto, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [user, allTasks.length, isLoading, userData?.autoSchedule]);

  // Manual scheduling function for all future tasks
  const handleManualSchedule = async () => {
    if (!user || isScheduling) return;

    setIsScheduling(true);
    onScheduleStart?.();

    try {
      // Force reschedule all tasks when manually triggered
      const result = await scheduleTasks(user.uid, true);
      console.log("Manual scheduling result:", result);
    } catch (error) {
      console.error("Manual scheduling error:", error);
      onScheduleError?.(error.message);
    } finally {
      setIsScheduling(false);
      onScheduleEnd?.();
    }
  };

  return {
    isScheduling,
    handleManualSchedule,
  };
};

export default CalendarScheduler;
