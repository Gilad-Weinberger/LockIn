import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  getUserTasks,
  updateTasksWithScheduling,
} from "@/lib/functions/taskFunctions";
import { getUserSchedulingRules } from "@/lib/functions/userFunctions";
import { serverTimestamp } from "firebase/firestore";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Create the AI prompt for scheduling tasks
 * @param {string} userSchedulingRules - User's custom scheduling rules
 * @param {Array} tasksToSchedule - Tasks to be scheduled
 * @returns {string} Generated scheduling prompt
 */
export const createSchedulingPrompt = (
  userSchedulingRules,
  tasksToSchedule
) => {
  const userRulesSection = userSchedulingRules
    ? `USER'S CUSTOM SCHEDULING RULES:
${userSchedulingRules}

CRITICAL: The user's custom scheduling rules above are MANDATORY and must override any default scheduling logic. These rules represent the user's personal preferences and constraints.`
    : `No custom scheduling rules provided. Use advanced productivity scheduling principles and psychological research on optimal work patterns.`;

  const currentDate = new Date();
  const currentHour = currentDate.getHours();

  // Determine starting date and time
  const startDate = new Date(currentDate);
  if (currentHour >= 18) {
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(9, 0, 0, 0);
  } else {
    startDate.setHours(Math.max(currentHour + 1, 9), 0, 0, 0);
  }

  return `You are an elite productivity expert and AI scheduling assistant with deep expertise in:
- Cognitive psychology and optimal performance timing
- Task complexity analysis and duration estimation
- Energy management and circadian rhythm optimization
- Project management and deadline planning
- Workflow optimization and context switching minimization

${userRulesSection}

CURRENT CONTEXT:
- Current Date/Time: ${currentDate.toISOString()}
- Scheduling Start Point: ${startDate.toISOString()}
- Day of Week: ${currentDate.toLocaleDateString("en-US", { weekday: "long" })}
- Current Hour: ${currentHour} (${
    currentHour < 12 ? "Morning" : currentHour < 17 ? "Afternoon" : "Evening"
  })

TASKS TO SCHEDULE:
${JSON.stringify(tasksToSchedule, null, 2)}

ADVANCED SCHEDULING FRAMEWORK:

🧠 COGNITIVE OPTIMIZATION PRINCIPLES:
- Peak cognitive performance: 9:00-11:00 AM (focus work, complex problem-solving)
- Secondary peak: 2:00-4:00 PM (analytical tasks, planning)  
- Low energy periods: 1:00-2:00 PM (admin, routine tasks), after 5:00 PM
- Context switching penalty: 15-25 minutes to refocus after interruption
- Deep work blocks: Minimum 90 minutes for complex tasks
- Ultradian rhythms: 90-120 minute focused work cycles with 15-20 minute breaks

⏰ INTELLIGENT DURATION ESTIMATION:
Analyze each task's title, description, and type to estimate realistic duration:

RESEARCH & LEARNING TASKS:
- "Research [topic]" = 2-3 hours
- "Learn [skill/technology]" = 3-4 hours  
- "Study for [exam]" = 2-4 hours
- "Read [document/book]" = 1-2 hours per 50 pages estimated

CREATIVE & DESIGN WORK:
- "Design [something]" = 2-4 hours
- "Create [content]" = 1.5-3 hours
- "Write [article/report]" = 2-3 hours (500-1000 words/hour)
- "Brainstorm [ideas]" = 1-1.5 hours

DEVELOPMENT & TECHNICAL:
- "Code [feature]" = 3-6 hours depending on complexity
- "Debug [issue]" = 1-4 hours (highly variable)
- "Test [functionality]" = 1-2 hours
- "Deploy [project]" = 0.5-2 hours
- "Review code" = 0.5-1 hour per 200 lines

MEETINGS & COMMUNICATION:
- "Meeting with [person]" = 1 hour (default)
- "Team standup" = 0.5 hours
- "Workshop/training" = 2-4 hours
- "Call [client/vendor]" = 0.5-1 hour
- "Email [task description]" = 0.25-0.5 hours

PROJECT MANAGEMENT:
- "Plan [project]" = 2-3 hours
- "Review progress" = 0.5-1 hour
- "Update documentation" = 1-2 hours
- "Prepare presentation" = 2-4 hours

ADMINISTRATIVE:
- "Fill out [forms]" = 0.5-1 hour
- "Organize [files/system]" = 1-2 hours
- "Schedule [appointments]" = 0.25-0.5 hours

🎯 DEADLINE INTELLIGENCE:
For tasks with deadlines (check taskDate field):
- If deadline is in 1-2 days: Schedule IMMEDIATELY in next available "do" priority slot
- If deadline is in 3-7 days: Schedule in top 3 priority slots this week
- If deadline is in 1-2 weeks: Schedule strategically, allowing buffer time
- If deadline is >2 weeks: Schedule based on priority and workload balance

For tasks containing deadline keywords ("due", "deadline", "submit", "deliver"):
- Add 25% buffer time to estimated duration
- Schedule completion 1 day before actual deadline when possible
- Break large deadline tasks (>4 hours) into multiple sessions

🏆 PRIORITY-BASED SCHEDULING LOGIC:

DO (Urgent + Important) - PRIME TIME SCHEDULING:
- Schedule during peak cognitive hours (9-11 AM)
- Allow maximum focus time (90-120 minutes minimum)
- Minimal context switching
- Buffer time before/after for preparation and wrap-up

PLAN (Important, Not Urgent) - STRATEGIC SCHEDULING:
- Schedule during secondary peak hours (2-4 PM)
- Allow adequate time for deep thinking
- Group related planning tasks together
- Schedule when energy is good but not at absolute peak

DELEGATE (Urgent, Not Important) - EFFICIENCY SCHEDULING:
- Schedule during collaborative hours (10 AM-12 PM, 2-5 PM)
- Batch similar delegation tasks
- Allow time for follow-up and communication
- Schedule when others are likely available

🛡️ ADVANCED CONSTRAINTS:

TEMPORAL CONSTRAINTS:
- Core work hours: 9:00 AM - 6:00 PM (Monday-Friday)
- Lunch break: 12:00-1:00 PM (no scheduling)
- No weekend work unless explicitly mentioned in user rules
- Morning energy protection: Reserve 9-11 AM for highest priority work
- Afternoon energy dip: 1-2 PM reserved for low-cognitive tasks only

COGNITIVE CONSTRAINTS:
- Maximum 4 hours of deep work per day
- No more than 2 consecutive high-focus tasks
- 15-minute buffer between different types of tasks
- 30-minute buffer between high-intensity tasks
- Maximum 6 hours of scheduled work per day (leave 2 hours for spontaneous work)

WORKFLOW OPTIMIZATION:
- Group similar tasks together (batch processing)
- Schedule complementary tasks in sequence when possible
- Avoid context switching between vastly different task types
- Front-load important tasks earlier in the week
- Leave Friday afternoons lighter for review and planning

🎨 PERSONALIZATION FACTORS:
Consider these patterns unless user rules specify otherwise:
- Monday: Planning and strategy, easier ramp-up
- Tuesday-Thursday: Peak productivity days, highest priority work
- Friday: Review, cleanup, lighter tasks, planning for next week
- Account for meeting-heavy days by scheduling shorter focused work blocks
- Consider commute times and personal energy patterns if mentioned in user context

📊 INTELLIGENT SCHEDULING OUTPUT REQUIREMENTS:

For each scheduled task, provide:
1. **Optimal Time Slot**: Based on task complexity and cognitive demands
2. **Precise Duration**: Estimated based on task analysis, not generic defaults
3. **Strategic Reasoning**: Detailed explanation of WHY this specific time was chosen
4. **Buffer Considerations**: How transitions and context switching were handled
5. **Energy Alignment**: How the scheduling matches cognitive energy patterns
6. **Priority Justification**: Why this task gets this priority level in the schedule

CRITICAL SUCCESS FACTORS:
✅ Every task must be scheduled (no orphaned tasks)
✅ No time conflicts or overlaps
✅ Realistic time estimates based on task analysis
✅ Strategic use of peak energy periods
✅ Adequate buffers and transition time
✅ Deadline awareness and backward planning
✅ Priority-based optimal time allocation
✅ Workflow optimization and task grouping

Return ONLY a valid JSON object in this exact format:
{
  "scheduledTasks": [
    {
      "id": "task_id_1",
      "startDate": "2024-01-15T09:00:00.000Z",
      "endDate": "2024-01-15T12:00:00.000Z",
      "scheduling_reasoning": "This 'DO' priority task requiring deep analysis was scheduled during peak cognitive hours (9 AM-12 PM) to maximize focus and quality. The 3-hour duration was estimated based on the complexity indicated by 'research and analysis' in the task title. Positioned at start of day to avoid context switching and energy depletion from other tasks."
    }
  ],
  "overall_reasoning": "Comprehensive explanation of the strategic scheduling approach, including how cognitive psychology principles, energy management, deadline pressures, and user preferences were balanced to create an optimal daily workflow.",
  "scheduling_summary": {
    "total_tasks_scheduled": 0,
    "total_time_allocated": "X hours Y minutes",
    "scheduling_period": "YYYY-MM-DD to YYYY-MM-DD", 
    "peak_hours_utilization": "X hours of prime cognitive time allocated",
    "deadline_tasks_count": 0,
    "energy_optimization_score": "High/Medium/Low based on alignment with natural rhythms",
    "key_considerations": ["Specific factors that influenced the scheduling decisions"]
  }
}

REMEMBER: This is not just task scheduling - it's cognitive performance optimization. Every decision should be backed by productivity science and tailored to maximize the user's effectiveness, energy, and well-being.`;
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
 * @returns {Promise<Object>} Scheduling result with reasoning
 */
export const scheduleTasksService = async (userId, forceReschedule = false) => {
  // Validate inputs
  if (!userId) {
    throw new Error("User ID is required");
  }

  // Check if Gemini API key is available
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("AI service not configured");
  }

  // Get user's scheduling rules
  const userSchedulingRules = await getUserSchedulingRules(userId);

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

  try {
    console.log("Starting AI scheduling process for user:", userId);

    // Create AI scheduling prompt
    const prompt = createSchedulingPrompt(userSchedulingRules, tasksToSchedule);

    // Process tasks with AI
    const { scheduledTasks, aiReasoning } = await processTasksWithAI(
      tasksToSchedule,
      prompt
    );

    // Merge AI scheduled tasks with original task data
    const tasksWithScheduling = scheduledTasks
      .map((aiTask) => {
        const originalTask = tasksToSchedule.find(
          (task) => task.id === aiTask.id
        );
        if (!originalTask) {
          console.warn(
            `AI returned task ID ${aiTask.id} that doesn't exist in original tasks`
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

    // Update tasks in Firestore with scheduling information
    await updateTasksWithScheduling(tasksWithScheduling);

    console.log(
      `Successfully scheduled ${tasksWithScheduling.length} tasks using AI`
    );

    return {
      message: `Successfully scheduled ${tasksWithScheduling.length} tasks using AI`,
      scheduledTasks: tasksWithScheduling.length,
      tasks: tasksWithScheduling.map((task) => ({
        id: task.id,
        title: task.title,
        startDate: task.startDate,
        endDate: task.endDate,
        reasoning: task.scheduling_reasoning,
        priority: task.priority,
      })),
      reasoning: aiReasoning,
    };
  } catch (error) {
    console.error("AI Scheduling service error:", error);
    throw new Error(`Failed to schedule tasks with AI: ${error.message}`);
  }
};
