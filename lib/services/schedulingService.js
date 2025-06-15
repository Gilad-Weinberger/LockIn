import { getUserTasks, updateTasksWithScheduling } from "@/lib/functions/taskFunctions";
import { serverTimestamp } from "firebase/firestore";

/**
 * Scheduling service - schedules tasks for a user
 * @param {string} userId - The user ID
 * @param {boolean} forceReschedule - Whether to force reschedule all tasks
 * @returns {Promise<Object>} The scheduling result
 */
export const scheduleTasksService = async (userId, forceReschedule = false) => {
  try {
    console.log("Starting scheduling process for user:", userId);

    // Fetch user's tasks from Firestore
    const allTasks = await getUserTasks(userId);

    console.log(`Found ${allTasks.length} tasks for user`);

    // DEBUG: Log task details to understand what's happening
    console.log(
      "Task details:",
      allTasks.map((task) => ({
        id: task.id,
        title: task.title,
        isDone: task.isDone,
        priority: task.priority,
        hasStartDate: !!task.startDate,
        hasEndDate: !!task.endDate,
        taskDate: task.taskDate,
      }))
    );

    // Filter tasks that need scheduling
    const tasksToSchedule = allTasks.filter((task) => {
      // Skip completed tasks
      if (task.isDone) return false;

      // Skip tasks marked for deletion
      if (task.priority === "delete") return false;

      // If force reschedule, schedule all non-completed tasks
      if (forceReschedule) return true;

      // Otherwise, only schedule tasks that don't have scheduling info
      return !task.startDate || !task.endDate;
    });

    console.log(`${tasksToSchedule.length} tasks need scheduling`);

    if (tasksToSchedule.length === 0) {
      return {
        message: "No tasks need scheduling",
        scheduledTasks: 0,
        tasks: [],
      };
    }

    // Basic scheduling algorithm
    const scheduledTasks = await scheduleTasksBasicAlgorithm(
      tasksToSchedule,
      userId
    );

    // Update tasks in Firestore with scheduling information
    await updateTasksWithScheduling(scheduledTasks);

    console.log(`Successfully scheduled ${scheduledTasks.length} tasks`);

    return {
      message: `Successfully scheduled ${scheduledTasks.length} tasks`,
      scheduledTasks: scheduledTasks.length,
      tasks: scheduledTasks.map((task) => ({
        id: task.id,
        startDate: task.startDate,
        endDate: task.endDate,
        reasoning: task.scheduling_reasoning || "Automatically scheduled",
      })),
    };
  } catch (error) {
    console.error("Scheduling service error:", error);
    throw new Error(`Failed to schedule tasks: ${error.message}`);
  }
};

/**
 * Basic scheduling algorithm
 * @param {Array} tasks - Tasks to schedule
 * @param {string} userId - User ID
 * @returns {Array} Scheduled tasks with startDate and endDate
 */
const scheduleTasksBasicAlgorithm = async (tasks, userId) => {
  const now = new Date();
  const scheduledTasks = [];

  // Start scheduling from tomorrow if it's after 6 PM, otherwise from today
  const startDate = new Date(now);
  if (now.getHours() >= 18) {
    startDate.setDate(startDate.getDate() + 1);
  }
  startDate.setHours(9, 0, 0, 0); // Start at 9 AM

  let currentScheduleTime = new Date(startDate);

  // Sort tasks by priority (do > plan > delegate)
  const priorityOrder = { do: 1, plan: 2, delegate: 3 };
  const sortedTasks = tasks.sort((a, b) => {
    const aPriority = priorityOrder[a.priority] || 4;
    const bPriority = priorityOrder[b.priority] || 4;

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // If same priority, sort by task date (if available)
    if (a.taskDate && b.taskDate) {
      return new Date(a.taskDate) - new Date(b.taskDate);
    }

    return 0;
  });

  for (const task of sortedTasks) {
    // Skip weekends for work tasks
    while (
      currentScheduleTime.getDay() === 0 ||
      currentScheduleTime.getDay() === 6
    ) {
      currentScheduleTime.setDate(currentScheduleTime.getDate() + 1);
      currentScheduleTime.setHours(9, 0, 0, 0);
    }

    // Skip lunch time (12-1 PM) and after work hours (6 PM - 9 AM next day)
    if (currentScheduleTime.getHours() >= 18) {
      currentScheduleTime.setDate(currentScheduleTime.getDate() + 1);
      currentScheduleTime.setHours(9, 0, 0, 0);
    } else if (
      currentScheduleTime.getHours() >= 12 &&
      currentScheduleTime.getHours() < 13
    ) {
      currentScheduleTime.setHours(13, 0, 0, 0);
    }

    // Determine task duration based on type and priority
    let durationHours = 1; // Default 1 hour

    if (task.type === "event") {
      durationHours = 1; // Events are typically 1 hour
    } else if (task.priority === "do") {
      durationHours = 2; // Important urgent tasks get more time
    } else if (task.priority === "plan") {
      durationHours = 1.5; // Important non-urgent tasks
    } else {
      durationHours = 1; // Default for other tasks
    }

    const taskStartTime = new Date(currentScheduleTime);
    const taskEndTime = new Date(currentScheduleTime);
    taskEndTime.setHours(taskEndTime.getHours() + durationHours);

    // Create scheduled task object
    const scheduledTask = {
      ...task,
      startDate: taskStartTime,
      endDate: taskEndTime,
      scheduledAt: serverTimestamp(),
      scheduling_reasoning: `Scheduled as ${
        task.priority || "general"
      } priority task for ${durationHours} hours`,
    };

    scheduledTasks.push(scheduledTask);

    // Move to next available slot (add 30 min buffer)
    currentScheduleTime = new Date(taskEndTime);
    currentScheduleTime.setMinutes(currentScheduleTime.getMinutes() + 30);
  }

  return scheduledTasks;
};
