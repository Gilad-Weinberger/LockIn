import { GoogleGenerativeAI } from "@google/generative-ai";
import { getUserPrioritizingRules } from "@/lib/functions/userFunctions";
import { updateDatabaseWithPriorities } from "@/lib/functions/taskFunctions";
import { getUserSubscriptionLevel } from "@/lib/utils/subscription-utils";
import { getPrioritizationPrompt } from "@/lib/ai-prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Pre-process event tasks and categorize them automatically
 * @param {Array} allUserTasks - All user tasks
 * @returns {Object} Event categorization results
 */
export const processEventTasks = (allUserTasks) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventTasks = allUserTasks.filter((task) => task.type === "event");
  const nonEventTasks = allUserTasks.filter((task) => task.type !== "event");

  const eventReasoning = {};
  const eventsForDo = [];
  const eventsForPlan = [];

  eventTasks.forEach((task) => {
    if (task.taskDate) {
      const taskDate = new Date(task.taskDate);
      const now = new Date();

      if (taskDate.toDateString() === now.toDateString()) {
        // Event is today - goes to DO
        eventsForDo.push(task.id);
        eventReasoning[
          task.id
        ] = `Automatically placed in DO quadrant because this is an EVENT scheduled for today (${task.taskDate}). Events must be attended on their scheduled date and cannot be rescheduled, making them urgent and important.`;
      } else if (taskDate < now) {
        // Past event - goes to DO to handle immediately
        eventsForDo.push(task.id);
        eventReasoning[
          task.id
        ] = `Placed in DO quadrant because this is a PAST EVENT (${task.taskDate}) that requires immediate attention - either to reschedule or cancel. Past events need urgent action.`;
      } else {
        // Future event - goes to PLAN
        eventsForPlan.push(task.id);
        const daysUntil = Math.ceil((taskDate - now) / (1000 * 60 * 60 * 24));
        eventReasoning[
          task.id
        ] = `Placed in PLAN quadrant because this is an EVENT scheduled for ${task.taskDate} (${daysUntil} days from now). Future events are important but not immediately urgent - they need planning and preparation.`;
      }
    } else {
      // Event without date - goes to PLAN by default
      eventsForPlan.push(task.id);
      eventReasoning[
        task.id
      ] = `Placed in PLAN quadrant because this is an EVENT without a specific date. Events are important but require scheduling and planning to determine the appropriate timeframe.`;
    }
  });

  return {
    eventTasks,
    nonEventTasks,
    eventReasoning,
    eventsForDo,
    eventsForPlan,
  };
};

/**
 * Process tasks with AI for prioritization
 * @param {Array} nonEventTasks - Non-event tasks to process
 * @param {string} prompt - AI prompt
 * @returns {Promise<Object>} AI prioritization result
 */
export const processTasksWithAI = async (nonEventTasks, prompt) => {
  const tasksForAI = nonEventTasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description || "",
    category: task.category || "",
    type: task.type || "deadline",
    dueDate: task.taskDate,
    isCompleted: task.isDone || false,
  }));

  let prioritizedTasks;
  let aiReasoning = {
    overall: "AI processing failed, using fallback prioritization",
    individual: {},
  };

  if (tasksForAI.length === 0) {
    console.log(
      "No non-event tasks to process, using event-only categorization"
    );
    prioritizedTasks = {
      do: [],
      plan: [],
      delegate: [],
      delete: [],
    };
    aiReasoning.overall =
      "Only events were found - no deadline tasks to prioritize. Events are automatically categorized based on their dates.";
  } else {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log("AI response received, length:", text.length);

      // Parse the AI response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No valid JSON found in AI response");
        }
        const aiResponse = JSON.parse(jsonMatch[0]);
        prioritizedTasks = {
          do: aiResponse.do || [],
          plan: aiResponse.plan || [],
          delegate: aiResponse.delegate || [],
          delete: aiResponse.delete || [],
        };
        aiReasoning = aiResponse.reasoning || aiReasoning;
        console.log("AI prioritization successful:", prioritizedTasks);
      } catch (parseError) {
        console.error("Failed to parse AI response:", text);
        // Fallback: distribute non-event tasks evenly if AI parsing fails
        const taskIds = nonEventTasks.map((task) => task.id);
        const quarter = Math.ceil(taskIds.length / 4);

        prioritizedTasks = {
          do: taskIds.slice(0, quarter),
          plan: taskIds.slice(quarter, quarter * 2),
          delegate: taskIds.slice(quarter * 2, quarter * 3),
          delete: taskIds.slice(quarter * 3),
        };

        // Create fallback reasoning
        aiReasoning.overall =
          "AI response parsing failed. Used fallback distribution: evenly distributed tasks across quadrants based on creation order.";
        taskIds.forEach((taskId, index) => {
          const quadrant =
            index < quarter
              ? "DO"
              : index < quarter * 2
              ? "PLAN"
              : index < quarter * 3
              ? "DELEGATE"
              : "DELETE";
          aiReasoning.individual[
            taskId
          ] = `Placed in ${quadrant} quadrant using fallback distribution due to AI parsing error.`;
        });

        console.log("Using fallback prioritization:", prioritizedTasks);
      }
    } catch (aiError) {
      console.error("AI API error:", aiError);

      // For AI errors, use fallback logic for non-event tasks
      console.log("Using fallback prioritization due to AI error");
      const taskIds = nonEventTasks.map((task) => task.id);
      const quarter = Math.ceil(taskIds.length / 4);

      prioritizedTasks = {
        do: taskIds.slice(0, quarter),
        plan: taskIds.slice(quarter, quarter * 2),
        delegate: taskIds.slice(quarter * 2, quarter * 3),
        delete: taskIds.slice(quarter * 3),
      };

      // Create fallback reasoning
      aiReasoning.overall =
        "AI service unavailable. Used fallback distribution: evenly distributed tasks across quadrants based on creation order.";
      taskIds.forEach((taskId, index) => {
        const quadrant =
          index < quarter
            ? "DO"
            : index < quarter * 2
            ? "PLAN"
            : index < quarter * 3
            ? "DELEGATE"
            : "DELETE";
        aiReasoning.individual[
          taskId
        ] = `Placed in ${quadrant} quadrant using fallback distribution due to AI service unavailability.`;
      });
    }
  }

  return { prioritizedTasks, aiReasoning };
};

/**
 * Merge event tasks with AI results
 * @param {Object} prioritizedTasks - AI prioritization results
 * @param {Array} eventsForDo - Events categorized for DO
 * @param {Array} eventsForPlan - Events categorized for PLAN
 * @param {Object} aiReasoning - AI reasoning
 * @param {Object} eventReasoning - Event reasoning
 * @param {number} eventTasksLength - Number of event tasks
 * @returns {Object} Combined results
 */
export const mergeEventResults = (
  prioritizedTasks,
  eventsForDo,
  eventsForPlan,
  aiReasoning,
  eventReasoning,
  eventTasksLength
) => {
  // Merge pre-categorized events with AI results
  prioritizedTasks.do = [...eventsForDo, ...(prioritizedTasks.do || [])];
  prioritizedTasks.plan = [...eventsForPlan, ...(prioritizedTasks.plan || [])];

  // Merge event reasoning with AI reasoning
  const combinedReasoning = {
    overall:
      aiReasoning.overall +
      (eventTasksLength > 0
        ? ` Additionally, ${eventTasksLength} events were automatically categorized based on their scheduled dates.`
        : ""),
    individual: {
      ...aiReasoning.individual,
      ...eventReasoning,
    },
  };

  return { prioritizedTasks, combinedReasoning };
};

/**
 * Validate and handle missing tasks
 * @param {Object} prioritizedTasks - Current prioritization
 * @param {Array} allUserTasks - All user tasks
 * @param {Object} combinedReasoning - Current reasoning
 * @returns {Object} Updated prioritization and reasoning
 */
export const validateAndHandleMissingTasks = (
  prioritizedTasks,
  allUserTasks,
  combinedReasoning
) => {
  const allCategorizedIds = [
    ...(prioritizedTasks.do || []),
    ...(prioritizedTasks.plan || []),
    ...(prioritizedTasks.delegate || []),
    ...(prioritizedTasks.delete || []),
  ];

  const originalTaskIds = allUserTasks.map((task) => task.id);
  const missingIds = originalTaskIds.filter(
    (id) => !allCategorizedIds.includes(id)
  );

  // Add any missing tasks to the "plan" category
  if (missingIds.length > 0) {
    prioritizedTasks.plan = [...(prioritizedTasks.plan || []), ...missingIds];
    missingIds.forEach((taskId) => {
      combinedReasoning.individual[taskId] =
        "Placed in PLAN quadrant as a fallback for tasks that weren't properly categorized during processing.";
    });
    console.log("Added missing tasks to plan:", missingIds);
  }

  return { prioritizedTasks, combinedReasoning };
};

/**
 * Main prioritization service function
 * @param {Array} tasks - All tasks
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Prioritization result with reasoning
 */
export const prioritizeTasksService = async (tasks, userId) => {
  // Validate inputs
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    throw new Error("No tasks provided");
  }
  if (!userId) {
    throw new Error("User ID is required");
  }

  // Check if Gemini API key is available
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("AI service not configured");
  }

  // Get user's prioritizing rules and subscription level
  const userPrioritizingRules = await getUserPrioritizingRules(userId);
  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  // Filter ALL user tasks to force complete re-prioritization
  const allUserTasks = tasks.filter(
    (task) => !task.isDone && task.userId === userId
  );

  if (allUserTasks.length === 0) {
    return {
      do: [],
      plan: [],
      delegate: [],
      delete: [],
      reasoning: {
        overall: "No tasks available for prioritization",
        individual: {},
      },
    };
  }

  // Process event tasks
  const {
    eventTasks,
    nonEventTasks,
    eventReasoning,
    eventsForDo,
    eventsForPlan,
  } = processEventTasks(allUserTasks);

  console.log(
    `Pre-categorized events: ${eventsForDo.length} to DO, ${eventsForPlan.length} to PLAN`
  );

  // Create AI prompt based on subscription level
  const prompt = getPrioritizationPrompt(
    subscriptionLevel,
    userPrioritizingRules,
    nonEventTasks
  );

  // Process with AI
  const { prioritizedTasks, aiReasoning } = await processTasksWithAI(
    nonEventTasks,
    prompt
  );

  // Merge results
  const { prioritizedTasks: mergedTasks, combinedReasoning } =
    mergeEventResults(
      prioritizedTasks,
      eventsForDo,
      eventsForPlan,
      aiReasoning,
      eventReasoning,
      eventTasks.length
    );

  console.log("Final prioritization after merging events:", mergedTasks);

  // Validate and handle missing tasks
  const { prioritizedTasks: finalTasks, combinedReasoning: finalReasoning } =
    validateAndHandleMissingTasks(mergedTasks, allUserTasks, combinedReasoning);

  // Update database
  await updateDatabaseWithPriorities(allUserTasks, finalTasks);

  console.log(
    `Re-prioritized all ${allUserTasks.length} tasks, returning results with reasoning`
  );

  return {
    ...finalTasks,
    reasoning: finalReasoning,
  };
};
