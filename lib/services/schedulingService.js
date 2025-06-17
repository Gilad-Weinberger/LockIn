import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  getUserTasks,
  updateTasksWithScheduling,
} from "@/lib/functions/taskFunctions";
import { getUserSchedulingRules } from "@/lib/functions/userFunctions";
import { getUserSubscriptionLevel } from "@/lib/utils/subscription-utils";
import { getSchedulingPrompt } from "@/lib/ai-prompts";
import { serverTimestamp } from "firebase/firestore";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Preprocess tasks to separate events from other tasks
 * @param {Array} tasks - All tasks to be scheduled
 * @returns {Object} Separated events and non-events
 */
const preprocessEvents = (tasks) => {
  const eventsToSchedule = tasks.filter((task) => task.type === "event");
  const nonEventsToSchedule = tasks.filter((task) => task.type !== "event");

  return { eventsToSchedule, nonEventsToSchedule };
};

/**
 * Schedule events with their fixed dates from taskDate
 * @param {Array} events - Events to schedule
 * @returns {Array} Scheduled events with startDate and endDate
 */
const scheduleEventsWithFixedDates = (events) => {
  return events
    .map((event) => {
      if (!event.taskDate) {
        // If no taskDate, return as-is for AI processing
        return null;
      }

      const taskDate = new Date(event.taskDate);

      // Extract just the date part and set reasonable default times
      const eventDate = new Date(taskDate);
      eventDate.setHours(0, 0, 0, 0); // Reset to start of day

      // Check if original taskDate had a specific time
      const originalHour = taskDate.getHours();
      const originalMinute = taskDate.getMinutes();

      let startDate, endDate;

      if (originalHour === 0 && originalMinute === 0) {
        // No specific time was set, use default event timing (2 PM - 3 PM)
        startDate = new Date(eventDate);
        startDate.setHours(14, 0, 0, 0);
        endDate = new Date(eventDate);
        endDate.setHours(15, 0, 0, 0);
      } else {
        // Preserve the original time
        startDate = new Date(taskDate);
        endDate = new Date(taskDate);
        endDate.setHours(endDate.getHours() + 1); // Default 1-hour duration
      }

      return {
        ...event,
        startDate,
        endDate,
        scheduling_reasoning: `Event scheduled on its original date (${taskDate.toDateString()}) as events cannot be moved to different dates. ${
          originalHour === 0 && originalMinute === 0
            ? "Default time assigned as no specific time was provided."
            : "Original time preserved."
        }`,
      };
    })
    .filter((event) => event !== null);
};

/**
 * Process tasks with AI for scheduling
 * @param {Array} tasksToSchedule - Tasks that need scheduling
 * @param {string} prompt - AI prompt for scheduling
 * @returns {Promise<Object>} AI scheduling result
 */
const processTasksWithAI = async (tasksToSchedule, prompt) => {
  let scheduledTasks = [];
  let aiReasoning = {
    overall_reasoning: "Failed to get AI response, using fallback reasoning",
    scheduling_summary: {
      total_tasks_scheduled: 0,
      total_time_allocated: "0 hours",
      scheduling_period: "Not determined",
      key_considerations: ["Fallback scheduling"],
    },
  };

  console.log("Sending scheduling request to AI...");

  try {
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("AI scheduling response received, length:", text.length);

    // Parse the AI response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in AI response");
      }

      const aiResponse = JSON.parse(jsonMatch[0]);

      if (
        aiResponse.scheduledTasks &&
        Array.isArray(aiResponse.scheduledTasks)
      ) {
        scheduledTasks = aiResponse.scheduledTasks.map((task) => ({
          ...task,
          startDate: new Date(task.startDate),
          endDate: new Date(task.endDate),
          scheduling_reasoning:
            task.scheduling_reasoning || "AI scheduled task",
        }));

        aiReasoning = {
          overall_reasoning:
            aiResponse.overall_reasoning || "AI scheduling completed",
          scheduling_summary: aiResponse.scheduling_summary || {
            total_tasks_scheduled: scheduledTasks.length,
            total_time_allocated: `${scheduledTasks.length} hours`,
            scheduling_period: "AI determined",
            key_considerations: ["AI optimization"],
          },
        };

        console.log(
          "AI scheduling successful:",
          scheduledTasks.length,
          "tasks scheduled"
        );
      } else {
        throw new Error(
          "Invalid AI response format - missing scheduledTasks array"
        );
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      throw new Error(
        `Failed to parse AI scheduling response: ${parseError.message}`
      );
    }
  } catch (error) {
    console.error("AI scheduling error:", error);
    throw new Error(`AI scheduling failed: ${error.message}`);
  }

  return { scheduledTasks, aiReasoning };
};

/**
 * Main scheduling service function
 * @param {string} userId - User ID
 * @param {boolean} forceReschedule - Whether to reschedule all tasks (including already scheduled ones)
 * @param {number} maxTasks - Maximum number of tasks to process with AI
 * @returns {Promise<Object>} Scheduling result with reasoning
 */
export const scheduleTasksService = async (
  userId,
  forceReschedule = false,
  maxTasks = null
) => {
  // Validate inputs
  if (!userId) {
    throw new Error("User ID is required");
  }

  // Check if Gemini API key is available
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("AI service not configured");
  }

  // Get user's scheduling rules and subscription level
  const userSchedulingRules = await getUserSchedulingRules(userId);
  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  // Get all user tasks
  const allUserTasks = await getUserTasks(userId);

  if (!allUserTasks || allUserTasks.length === 0) {
    return {
      message: "No tasks found to schedule",
      scheduledTasks: 0,
      tasks: [],
      reasoning: {
        overall_reasoning: "No tasks were found for this user",
      },
    };
  }

  // Filter tasks to schedule
  let tasksToSchedule;
  if (forceReschedule) {
    // Force reschedule: schedule all incomplete tasks except those locked from AI scheduling
    tasksToSchedule = allUserTasks.filter(
      (task) => !task.isDone && !task.aiScheduleLocked
    );
  } else {
    // Normal scheduling: only schedule tasks that aren't already scheduled and not locked from AI scheduling
    tasksToSchedule = allUserTasks.filter(
      (task) =>
        !task.isDone &&
        !task.aiScheduleLocked &&
        (!task.startDate || !task.endDate)
    );
  }

  // Pre-process events to ensure they maintain their original dates
  const { eventsToSchedule, nonEventsToSchedule } =
    preprocessEvents(tasksToSchedule);

  // If we have events, schedule them first with their fixed dates
  let preScheduledEvents = [];
  if (eventsToSchedule.length > 0) {
    preScheduledEvents = scheduleEventsWithFixedDates(eventsToSchedule);
  }

  if (tasksToSchedule.length === 0) {
    const lockedCount = allUserTasks.filter(
      (task) => task.aiScheduleLocked && !task.isDone
    ).length;
    const alreadyScheduledCount = allUserTasks.filter(
      (task) =>
        !task.isDone && task.startDate && task.endDate && !task.aiScheduleLocked
    ).length;

    return {
      message: forceReschedule
        ? `No tasks to reschedule. ${lockedCount} tasks are locked from AI scheduling, ${alreadyScheduledCount} tasks are already scheduled.`
        : `All tasks are already scheduled. ${lockedCount} tasks are locked from AI scheduling.`,
      scheduledTasks: 0,
      tasks: [],
      reasoning: {
        overall_reasoning: forceReschedule
          ? "All incomplete tasks are either already scheduled or locked from AI scheduling"
          : "All incomplete tasks that are not locked from AI scheduling are already scheduled",
      },
    };
  }

  // If only events to schedule (no AI processing needed)
  if (nonEventsToSchedule.length === 0 && preScheduledEvents.length > 0) {
    await updateTasksWithScheduling(preScheduledEvents);

    return {
      message: `Successfully scheduled ${preScheduledEvents.length} events with fixed dates`,
      scheduledTasks: preScheduledEvents.length,
      tasks: preScheduledEvents.map((task) => ({
        id: task.id,
        title: task.title,
        startDate: task.startDate,
        endDate: task.endDate,
        reasoning: task.scheduling_reasoning,
        priority: task.priority,
      })),
      reasoning: {
        overall_reasoning:
          "Events were scheduled on their original dates as specified in taskDate",
      },
    };
  }

  try {
    console.log("Starting AI scheduling process for user:", userId);

    // Limit non-event tasks if maxTasks is specified (for free users)
    let nonEventsToScheduleFiltered = nonEventsToSchedule;
    let limitMessage = "";
    let originalNonEventCount = nonEventsToSchedule.length;

    if (maxTasks !== null && nonEventsToSchedule.length > maxTasks) {
      nonEventsToScheduleFiltered = nonEventsToSchedule.slice(0, maxTasks);
      limitMessage = ` Note: Only ${maxTasks} of ${originalNonEventCount} tasks were processed by AI due to your free plan limit.`;
      console.log(
        `Limited AI tasks for free user: ${originalNonEventCount} -> ${maxTasks}`
      );
    }

    // Create AI scheduling prompt based on subscription level (only for non-events)
    const prompt = getSchedulingPrompt(
      subscriptionLevel,
      userSchedulingRules,
      nonEventsToScheduleFiltered
    );

    // Process non-event tasks with AI
    let aiScheduledTasks = [];
    let aiReasoning = {
      overall_reasoning: "No non-event tasks to schedule with AI",
      scheduling_summary: {
        total_tasks_scheduled: 0,
        total_time_allocated: "0 hours",
        scheduling_period: "Not determined",
        key_considerations: ["Only events scheduled"],
      },
    };

    if (nonEventsToScheduleFiltered.length > 0) {
      const result = await processTasksWithAI(
        nonEventsToScheduleFiltered,
        prompt
      );
      aiScheduledTasks = result.scheduledTasks;
      aiReasoning = result.aiReasoning;
    }

    // Merge AI scheduled tasks with original task data
    const aiTasksWithScheduling = aiScheduledTasks
      .map((aiTask) => {
        const originalTask = nonEventsToScheduleFiltered.find(
          (task) => task.id === aiTask.id
        );
        if (!originalTask) {
          console.warn(
            `AI returned task ID ${aiTask.id} that doesn't exist in original non-event tasks`
          );
          return null;
        }

        return {
          ...originalTask,
          startDate: aiTask.startDate,
          endDate: aiTask.endDate,
          scheduledAt: serverTimestamp(),
          scheduling_reasoning: aiTask.scheduling_reasoning,
        };
      })
      .filter((task) => task !== null);

    // Combine pre-scheduled events with AI-scheduled tasks
    const allScheduledTasks = [...preScheduledEvents, ...aiTasksWithScheduling];

    // Update tasks in Firestore with scheduling information
    await updateTasksWithScheduling(allScheduledTasks);

    console.log(
      `Successfully scheduled ${allScheduledTasks.length} tasks (${preScheduledEvents.length} events + ${aiTasksWithScheduling.length} AI-scheduled)`
    );

    return {
      message: `Successfully scheduled ${allScheduledTasks.length} tasks (${preScheduledEvents.length} events with fixed dates + ${aiTasksWithScheduling.length} AI-optimized tasks)${limitMessage}`,
      scheduledTasks: allScheduledTasks.length,
      tasks: allScheduledTasks.map((task) => ({
        id: task.id,
        title: task.title,
        startDate: task.startDate,
        endDate: task.endDate,
        reasoning: task.scheduling_reasoning,
        priority: task.priority,
      })),
      reasoning: {
        ...aiReasoning,
        overall_reasoning: `${aiReasoning.overall_reasoning}${
          preScheduledEvents.length > 0
            ? ` Additionally, ${preScheduledEvents.length} events were scheduled on their fixed dates as specified in their taskDate.`
            : ""
        }`,
      },
    };
  } catch (error) {
    console.error("AI Scheduling service error:", error);
    throw new Error(`Failed to schedule tasks with AI: ${error.message}`);
  }
};
