import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase";
import { doc, writeBatch, getDoc } from "firebase/firestore";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get user's prioritizing rules from the database
 * @param {string} userId - User ID
 * @returns {Promise<string>} User's prioritizing rules or empty string
 */
export const getUserPrioritizingRules = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data().prioritizingRules || "";
    }
    return "";
  } catch (error) {
    console.error("Error fetching user rules:", error);
    return "";
  }
};

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
      taskDate.setHours(0, 0, 0, 0);

      if (taskDate.getTime() === today.getTime()) {
        // Event is today - goes to DO
        eventsForDo.push(task.id);
        eventReasoning[
          task.id
        ] = `Automatically placed in DO quadrant because this is an EVENT scheduled for today (${task.taskDate}). Events must be attended on their scheduled date and cannot be rescheduled, making them urgent and important.`;
      } else if (taskDate < today) {
        // Past event - goes to DO to handle immediately
        eventsForDo.push(task.id);
        eventReasoning[
          task.id
        ] = `Placed in DO quadrant because this is a PAST EVENT (${task.taskDate}) that requires immediate attention - either to reschedule or cancel. Past events need urgent action.`;
      } else {
        // Future event - goes to PLAN
        eventsForPlan.push(task.id);
        const daysUntil = Math.ceil(
          (taskDate - today) / (1000 * 60 * 60 * 24)
        );
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
 * Create the AI prompt for prioritization
 * @param {string} userPrioritizingRules - User's custom rules
 * @param {Array} tasksForAI - Tasks to be processed by AI
 * @returns {string} Generated prompt
 */
export const createPrioritizationPrompt = (userPrioritizingRules, tasksForAI) => {
  const userRulesSection = userPrioritizingRules
    ? `USER'S CUSTOM PRIORITIZING RULES:
${userPrioritizingRules}

IMPORTANT: Follow the user's custom rules above when making prioritization decisions. These rules override default logic where applicable.`
    : `No custom prioritizing rules provided. Use standard Eisenhower Matrix principles.`;

  return `You are a productivity expert helping to categorize tasks using the Eisenhower Matrix (Do, Plan, Delegate, Delete). 

${userRulesSection}

Here are the tasks to categorize:
${JSON.stringify(tasksForAI, null, 2)}

Please categorize each task by its ID into one of these four categories:
- DO: Important and urgent tasks (do first)
- PLAN: Important but not urgent tasks (schedule)
- DELEGATE: Urgent but not important tasks (delegate if possible)
- DELETE: Neither urgent nor important tasks (eliminate)

Consider:
- Due dates (closer dates = more urgent)
- Task titles for importance/urgency keywords
- Categories for context
- User's custom rules (if provided above)

For DO and PLAN categories, return the task IDs sorted by priority within each group (first task ID = highest priority, second = second highest, etc.).

CRITICAL: You must provide detailed reasoning for EVERY decision. For each task, explain:
1. WHY it was placed in its specific quadrant
2. WHAT factors influenced the decision (due date, importance, urgency, user rules)
3. HOW it compares to other tasks in terms of priority
4. WHAT makes it more or less urgent/important than other tasks

Also provide an overall reasoning explaining the prioritization strategy used.

Return ONLY a valid JSON object in this exact format:
{
  "do": ["highest_priority_id", "second_priority_id"],
  "plan": ["highest_priority_id", "second_priority_id"],
  "delegate": ["id5"],
  "delete": ["id6"],
  "reasoning": {
    "overall": "Detailed explanation of the overall prioritization strategy used, considering user rules and task distribution",
    "individual": {
      "task_id_1": "Detailed explanation for why this specific task was categorized as it was",
      "task_id_2": "Detailed explanation for why this specific task was categorized as it was"
    }
  }
}

Make sure all task IDs are distributed across the four categories and every task ID appears exactly once. For DO and PLAN tasks, order them by urgency, importance, and due dates. Include detailed reasoning for every single task.`;
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
    console.log("No non-event tasks to process, using event-only categorization");
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
 * Update database with new priorities
 * @param {Array} allUserTasks - All user tasks
 * @param {Object} prioritizedTasks - Prioritization results
 * @returns {Promise<void>}
 */
export const updateDatabaseWithPriorities = async (
  allUserTasks,
  prioritizedTasks
) => {
  try {
    const batch = writeBatch(db);

    // First, clear all priorities for user's tasks
    allUserTasks.forEach((task) => {
      const taskRef = doc(db, "tasks", task.id);
      batch.update(taskRef, {
        priority: null,
        inGroupRank: null,
        prioritizedAt: null,
      });
    });

    // Then set new priorities
    ["do", "plan", "delegate", "delete"].forEach((priority) => {
      const taskIds = prioritizedTasks[priority] || [];
      taskIds.forEach((taskId, index) => {
        const taskRef = doc(db, "tasks", taskId);
        const updateData = {
          priority: priority,
          prioritizedAt: new Date().toISOString(),
          inGroupRank: index + 1, // First task gets 1, second gets 2, etc.
        };

        batch.update(taskRef, updateData);
      });
    });

    // Commit the batch write
    await batch.commit();
    console.log("Database updated successfully");
  } catch (dbError) {
    console.error("Database update error:", dbError);
    throw dbError;
  }
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

  // Get user's prioritizing rules
  const userPrioritizingRules = await getUserPrioritizingRules(userId);

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

  // Create AI prompt
  const prompt = createPrioritizationPrompt(userPrioritizingRules, nonEventTasks);

  // Process with AI
  const { prioritizedTasks, aiReasoning } = await processTasksWithAI(
    nonEventTasks,
    prompt
  );

  // Merge results
  const { prioritizedTasks: mergedTasks, combinedReasoning } = mergeEventResults(
    prioritizedTasks,
    eventsForDo,
    eventsForPlan,
    aiReasoning,
    eventReasoning,
    eventTasks.length
  );

  console.log("Final prioritization after merging events:", mergedTasks);

  // Validate and handle missing tasks
  const {
    prioritizedTasks: finalTasks,
    combinedReasoning: finalReasoning,
  } = validateAndHandleMissingTasks(mergedTasks, allUserTasks, combinedReasoning);

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