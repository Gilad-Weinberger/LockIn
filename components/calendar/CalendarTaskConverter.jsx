"use client";

import { useEffect } from "react";
import { updateTask } from "@/lib/functions/taskFunctions";

const CalendarTaskConverter = ({ user, allTasks, isLoading }) => {
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

  // This component doesn't render anything, it just handles the conversion logic
  return null;
};

export default CalendarTaskConverter;
