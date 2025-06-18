import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  getUserTasks,
  updateTasksWithScheduling,
} from "@/lib/functions/taskFunctions";
import { getUserSchedulingRules } from "@/lib/functions/userFunctions";
import { getUserSubscriptionLevel } from "@/lib/utils/subscription-utils";
import {
  getUserGoogleCalendarData,
  updateGoogleCalendarTokens,
} from "@/lib/functions/googleCalendarFunctions";
import GoogleCalendarService from "@/lib/services/google-calendar";
import { getSchedulingPrompt } from "@/lib/ai-prompts";
import { serverTimestamp } from "firebase/firestore";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Fetch existing Google Calendar events for pro users to avoid scheduling conflicts
 * @param {string} userId - User ID
 * @param {Date} scheduleStartDate - Start date for scheduling window
 * @param {Date} scheduleEndDate - End date for scheduling window
 * @returns {Promise<Array>} Array of existing Google Calendar events
 */
const fetchExistingGoogleCalendarEvents = async (
  userId,
  scheduleStartDate,
  scheduleEndDate
) => {
  try {
    // Get user's Google Calendar data
    const googleCalendarData = await getUserGoogleCalendarData(userId);

    if (!googleCalendarData.connected) {
      console.log("Google Calendar not connected for user:", userId);
      return [];
    }

    // Check if tokens need refresh
    const now = new Date().getTime();
    if (googleCalendarData.expiryDate && now >= googleCalendarData.expiryDate) {
      // Token expired, try to refresh
      if (!googleCalendarData.refreshToken) {
        console.warn(
          "Google Calendar access token expired and no refresh token available for user:",
          userId
        );
        return [];
      }

      try {
        const googleCalendarService = new GoogleCalendarService();
        const newTokens = await googleCalendarService.refreshToken(
          googleCalendarData.refreshToken
        );

        // Update tokens in database
        await updateGoogleCalendarTokens(userId, newTokens);

        // Use new tokens
        googleCalendarData.accessToken = newTokens.access_token;
        googleCalendarData.expiryDate = newTokens.expiry_date;
      } catch (refreshError) {
        console.error(
          "Failed to refresh Google Calendar tokens for scheduling:",
          refreshError
        );
        return [];
      }
    }

    // Create Google Calendar service and set credentials
    const googleCalendarService = new GoogleCalendarService();
    googleCalendarService.setCredentials({
      access_token: googleCalendarData.accessToken,
      refresh_token: googleCalendarData.refreshToken,
      expiry_date: googleCalendarData.expiryDate,
    });

    // Fetch events from Google Calendar within the scheduling window
    const events = await googleCalendarService.getEvents(
      scheduleStartDate.toISOString(),
      scheduleEndDate.toISOString()
    );

    // Transform events to a format suitable for AI prompt
    const transformedEvents = events.map((event) => ({
      id: event.id,
      title: event.summary || "Untitled Event",
      description: event.description || "",
      startDate: event.start?.dateTime || event.start?.date,
      endDate: event.end?.dateTime || event.end?.date,
      allDay: !event.start?.dateTime, // If no time, it's an all-day event
      location: event.location || "",
      status: event.status,
    }));

    console.log(
      `Fetched ${transformedEvents.length} existing Google Calendar events for scheduling conflict avoidance`
    );
    return transformedEvents;
  } catch (error) {
    console.error(
      "Error fetching Google Calendar events for scheduling:",
      error
    );
    return [];
  }
};

/**
 * Sync scheduled tasks to Google Calendar
 * @param {Array} scheduledTasks - Tasks that were scheduled
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
const syncTasksToGoogleCalendar = async (scheduledTasks, userId) => {
  if (!scheduledTasks.length || !userId) return;

  try {
    // Get user's Google Calendar data
    const googleCalendarData = await getUserGoogleCalendarData(userId);

    if (!googleCalendarData.connected || !googleCalendarData.autoSync) {
      console.log("Google Calendar auto-sync not enabled or not connected");
      return;
    }

    console.log(
      `Syncing ${scheduledTasks.length} scheduled tasks to Google Calendar`
    );

    // Check if tokens need refresh
    const now = new Date().getTime();
    let accessToken = googleCalendarData.accessToken;

    if (googleCalendarData.expiryDate && now >= googleCalendarData.expiryDate) {
      // Token expired, try to refresh
      if (!googleCalendarData.refreshToken) {
        console.error("Access token expired and no refresh token available");
        return;
      }

      try {
        const googleCalendarService = new GoogleCalendarService();
        const newTokens = await googleCalendarService.refreshToken(
          googleCalendarData.refreshToken
        );

        // Update tokens in database
        await updateGoogleCalendarTokens(userId, newTokens);

        // Use new tokens
        accessToken = newTokens.access_token;
      } catch (refreshError) {
        console.error(
          "Failed to refresh Google Calendar tokens:",
          refreshError
        );
        return;
      }
    }

    // Create Google Calendar service and set credentials
    const googleCalendarService = new GoogleCalendarService();
    googleCalendarService.setCredentials({
      access_token: accessToken,
      refresh_token: googleCalendarData.refreshToken,
      expiry_date: googleCalendarData.expiryDate,
    });

    // Sync each scheduled task to Google Calendar
    for (const task of scheduledTasks) {
      try {
        const eventData = {
          title: task.title || task.text,
          description: `Task: ${task.title || task.text}${
            task.scheduling_reasoning
              ? `\n\nScheduling: ${task.scheduling_reasoning}`
              : ""
          }`,
          startTime:
            task.startDate instanceof Date
              ? task.startDate.toISOString()
              : new Date(task.startDate).toISOString(),
          endTime:
            task.endDate instanceof Date
              ? task.endDate.toISOString()
              : new Date(task.endDate).toISOString(),
          timeZone: "UTC", // Use UTC for consistency, Google Calendar will handle timezone conversion
        };

        // Create event in Google Calendar
        const googleEvent = await googleCalendarService.createEvent(eventData);

        // Log successful sync (mapping will be stored client-side)
        if (googleEvent && googleEvent.id) {
          console.log(
            `Successfully synced task ${task.id} to Google Calendar: ${googleEvent.id}`
          );
        }
      } catch (error) {
        console.error(
          `Error syncing task ${task.id} to Google Calendar:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error syncing to Google Calendar:", error);
  }
};

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

    // Sync to Google Calendar
    await syncTasksToGoogleCalendar(preScheduledEvents, userId);

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

    // For pro users, fetch existing Google Calendar events to avoid conflicts
    let existingGoogleCalendarEvents = [];
    if (subscriptionLevel === "pro" && nonEventsToScheduleFiltered.length > 0) {
      console.log(
        "Fetching existing Google Calendar events for pro user conflict avoidance..."
      );

      // Calculate scheduling window (next 30 days from now)
      const currentDate = new Date();
      const scheduleStartDate = new Date(currentDate);
      const scheduleEndDate = new Date(currentDate);
      scheduleEndDate.setDate(scheduleEndDate.getDate() + 30);

      existingGoogleCalendarEvents = await fetchExistingGoogleCalendarEvents(
        userId,
        scheduleStartDate,
        scheduleEndDate
      );
    }

    // Create AI scheduling prompt based on subscription level (only for non-events)
    // Pass existing Google Calendar events to pro prompt for conflict avoidance
    const prompt = getSchedulingPrompt(
      subscriptionLevel,
      userSchedulingRules,
      nonEventsToScheduleFiltered,
      existingGoogleCalendarEvents // Pass existing events for pro users
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

    // Sync to Google Calendar
    await syncTasksToGoogleCalendar(allScheduledTasks, userId);

    console.log(
      `Successfully scheduled ${allScheduledTasks.length} tasks (${preScheduledEvents.length} events + ${aiTasksWithScheduling.length} AI-scheduled)`
    );

    const conflictAvoidanceMessage =
      subscriptionLevel === "pro" && existingGoogleCalendarEvents.length > 0
        ? ` AI avoided conflicts with ${existingGoogleCalendarEvents.length} existing Google Calendar events.`
        : "";

    return {
      message: `Successfully scheduled ${allScheduledTasks.length} tasks (${preScheduledEvents.length} events with fixed dates + ${aiTasksWithScheduling.length} AI-optimized tasks)${limitMessage}${conflictAvoidanceMessage}`,
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
        }${conflictAvoidanceMessage}`,
      },
    };
  } catch (error) {
    console.error("AI Scheduling service error:", error);
    throw new Error(`Failed to schedule tasks with AI: ${error.message}`);
  }
};
