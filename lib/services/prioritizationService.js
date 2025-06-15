import { GoogleGenerativeAI } from "@google/generative-ai";
import { getUserPrioritizingRules } from "@/lib/functions/userFunctions";
import { updateDatabaseWithPriorities } from "@/lib/functions/taskFunctions";

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
 * Create the AI prompt for prioritization
 * @param {string} userPrioritizingRules - User's custom rules
 * @param {Array} tasksForAI - Tasks to be processed by AI
 * @returns {string} Generated prompt
 */
export const createPrioritizationPrompt = (
  userPrioritizingRules,
  tasksForAI
) => {
  const userRulesSection = userPrioritizingRules
    ? `USER'S CUSTOM PRIORITIZING RULES:
${userPrioritizingRules}

CRITICAL: The user's custom prioritizing rules above are MANDATORY and must override any default prioritization logic. These rules represent the user's personal values, goals, and constraints.`
    : `No custom prioritizing rules provided. Use advanced productivity psychology and strategic thinking principles.`;

  const currentDate = new Date();
  const todayISO = currentDate.toISOString().split("T")[0];

  return `You are an elite productivity strategist and decision-making expert with deep expertise in:
- Behavioral psychology and cognitive decision-making
- Strategic priority frameworks and time management
- Deadline pressure analysis and risk assessment  
- Goal hierarchy and value-based prioritization
- Cognitive load management and energy optimization
- Impact analysis and leverage identification
- Opportunity cost evaluation and resource allocation

${userRulesSection}

CURRENT CONTEXT:
- Today's Date: ${todayISO}
- Current Time: ${currentDate.toLocaleTimeString()}
- Day of Week: ${currentDate.toLocaleDateString("en-US", { weekday: "long" })}
- Week Position: ${Math.ceil(currentDate.getDate() / 7)} of month

TASKS TO ANALYZE AND PRIORITIZE:
${JSON.stringify(tasksForAI, null, 2)}

ADVANCED PRIORITIZATION FRAMEWORK:

🎯 STRATEGIC IMPORTANCE ANALYSIS:
Evaluate each task's strategic value using multiple dimensions:

**IMPACT ASSESSMENT:**
- Revenue/Career Impact: Direct effect on income, career advancement, business growth
- Relationship Impact: Effect on professional relationships, team dynamics, reputation
- Learning Impact: Skill development, knowledge acquisition, capability building
- Health/Wellbeing Impact: Physical, mental, emotional health consequences
- Long-term Consequences: Future opportunities created or lost

**LEVERAGE EVALUATION:**
- High Leverage: Small effort, big results (multiplier effect)
- Medium Leverage: Proportional effort to results
- Low Leverage: High effort, small results (potential time sinks)
- Negative Leverage: Creates more problems than it solves

**COMPLEXITY & COGNITIVE LOAD:**
- Simple: Can be done quickly with minimal mental energy
- Moderate: Requires focused attention but manageable
- Complex: Needs deep thinking, research, or significant skill
- Overwhelming: May need to be broken down into smaller tasks

⚡ URGENCY INTELLIGENCE:
Move beyond simple deadline analysis to sophisticated urgency evaluation:

**DEADLINE PRESSURE ANALYSIS:**
- Imminent (0-2 days): Absolute priority, high stress impact
- Near-term (3-7 days): Significant pressure, needs immediate attention
- Medium-term (1-4 weeks): Moderate pressure, plan strategically
- Long-term (1+ months): Low pressure, opportunity for excellence

**CONSEQUENCE SEVERITY:**
- Critical: Catastrophic consequences if missed (legal, financial, career-ending)
- High: Significant negative impact (missed opportunities, damaged relationships)
- Medium: Moderate inconvenience or disappointment
- Low: Minimal real-world impact

**DEPENDENCY CHAINS:**
- Blocking Others: Tasks that prevent others from working (highest urgency)
- Blocked by Others: Tasks waiting on external dependencies (lower urgency)
- Independent: Can be done anytime without affecting others
- Chain Reaction: Completing this unlocks multiple other tasks

**WINDOW OF OPPORTUNITY:**
- Time-sensitive: Must be done within specific timeframe
- Seasonal: Optimal timing based on cycles, trends, availability
- Momentum-based: Builds on current energy or progress
- Flexible: Can be done anytime with equal effectiveness

🧠 PSYCHOLOGICAL FACTORS:
Consider human psychology in prioritization decisions:

**ENERGY MATCHING:**
- High-energy tasks: Creative work, complex problem-solving, important decisions
- Medium-energy tasks: Routine work, familiar activities, moderate challenges
- Low-energy tasks: Administrative work, simple communications, organizing

**MOTIVATION & RESISTANCE:**
- High motivation: Exciting, aligned with values, intrinsically rewarding
- Medium motivation: Somewhat interesting, mixed feelings
- Low motivation: Boring but necessary, external pressure only
- High resistance: Anxiety-provoking, skill gaps, fear of failure

**COMPLETION PSYCHOLOGY:**
- Quick wins: Build momentum and confidence (good for low-energy periods)
- Deep work: Require sustained focus and peak mental state
- Batch-able: Similar tasks that can be grouped for efficiency
- Interruptible: Can be started and stopped without losing progress

🔍 ADVANCED CATEGORIZATION LOGIC:

**DO (Urgent + Important) - IMMEDIATE ACTION:**
Must meet ALL criteria:
✅ High importance (significant impact on goals/wellbeing)
✅ High urgency (immediate consequences if delayed)
✅ Within your direct control and capability
✅ Cannot be effectively delegated
✅ Deadline within 48-72 hours OR catastrophic consequences

Examples:
- Crisis management and fire-fighting
- Legal/compliance deadlines with severe penalties
- Health emergencies or critical personal issues
- Client deliverables with contract implications
- Tasks blocking critical team members

**PLAN (Important but Not Urgent) - STRATEGIC FOCUS:**
The most critical category for long-term success:
✅ High importance (aligned with major goals/values)
✅ Low-medium urgency (no immediate deadline pressure)
✅ Requires strategic thinking and quality execution
✅ Builds capabilities, relationships, or future opportunities
✅ Prevention rather than reaction

Examples:
- Skill development and learning
- Relationship building and networking
- Strategic planning and goal setting
- System improvements and optimization
- Creative projects and innovation
- Health and wellness activities
- Financial planning and investment

**DELEGATE (Urgent but Not Important) - EFFICIENCY FOCUS:**
Tasks that create urgency but don't advance your core objectives:
✅ High urgency (time pressure or external demands)
✅ Low importance (minimal impact on your key goals)
✅ Can be done by others (within their capabilities)
✅ Routine, repeatable, or within standard procedures
✅ Provides learning opportunities for others

Examples:
- Routine administrative tasks
- Information gathering and research
- Standard communications and updates
- Meeting coordination and scheduling
- Basic customer service inquiries
- Data entry and processing

**DELETE (Neither Urgent nor Important) - ELIMINATION:**
Tasks that waste time and energy without meaningful return:
✅ Low importance (minimal impact on goals)
✅ Low urgency (no real consequences if ignored)
✅ Legacy tasks that are no longer relevant
✅ Perfectionist activities with diminishing returns
✅ Procrastination activities disguised as work

Examples:
- Excessive email checking and social media
- Perfectionist tweaking of completed work
- Attending irrelevant meetings or events
- Outdated processes that no longer serve a purpose
- Busy work that creates illusion of productivity

🎨 CONTEXTUAL INTELLIGENCE:
Consider broader context in prioritization decisions:

**TASK INTERDEPENDENCIES:**
- Prerequisite tasks: Must be completed before others can start
- Parallel tasks: Can be worked on simultaneously
- Sequential tasks: Follow logical order but flexible timing
- Optional tasks: Nice-to-have but not essential

**RESOURCE CONSTRAINTS:**
- Time availability: How much focused time do you realistically have?
- Energy patterns: When are you most/least productive?
- Tool/system requirements: What resources are needed?
- Collaboration needs: When are others available?

**STRATEGIC ALIGNMENT:**
- Core objectives: Direct contribution to primary goals
- Role responsibilities: Essential functions of your position
- Value proposition: What you're uniquely positioned to deliver
- Growth opportunities: Chances to expand capabilities or influence

📊 PRIORITIZATION OUTPUT REQUIREMENTS:

For each task, provide comprehensive analysis:
1. **Strategic Importance Score** (1-10): Overall value to goals and objectives
2. **Urgency Analysis**: Deadline pressure and consequence assessment
3. **Complexity Evaluation**: Mental energy and time requirements
4. **Leverage Factor**: Effort-to-impact ratio
5. **Dependency Status**: How it affects or is affected by other tasks
6. **Energy Requirements**: Cognitive load and optimal timing
7. **Quadrant Placement**: Why it belongs in specific category
8. **Priority Ranking**: Within-category priority order with reasoning

CRITICAL DECISION PRINCIPLES:
🔥 When in doubt between quadrants, ask: "What happens if this waits until tomorrow?"
🔥 If the answer is "catastrophic consequences" → DO
🔥 If the answer is "missed opportunity for improvement" → PLAN  
🔥 If the answer is "someone else gets frustrated" → DELEGATE
🔥 If the answer is "nothing meaningful changes" → DELETE

🏆 QUALITY OVER QUANTITY:
- Better to have 3 well-prioritized DO tasks than 10 poorly chosen ones
- PLAN category should get 60-70% of tasks (most important for long-term success)
- DO category should be limited to true emergencies and deadlines
- DELETE category should be substantial (20-30% of tasks are usually eliminable)

Return ONLY a valid JSON object in this exact format:
{
  "do": ["highest_priority_id", "second_priority_id"],
  "plan": ["highest_priority_id", "second_priority_id"],
  "delegate": ["task_id"],
  "delete": ["task_id"],
  "reasoning": {
    "overall": "Comprehensive strategic analysis of the prioritization approach, including key patterns identified, trade-offs made, and strategic focus areas. Explain the overarching logic that guided the categorization decisions.",
    "individual": {
      "task_id_1": "Detailed multi-dimensional analysis: Strategic importance (X/10), Urgency level (immediate/near-term/medium/long), Impact type (revenue/career/learning/health), Leverage factor (high/medium/low), Complexity (simple/moderate/complex), Dependency status, Energy requirements, and final placement reasoning with specific justification for quadrant selection.",
      "task_id_2": "Similar comprehensive analysis for each task..."
    },
    "strategic_insights": {
      "focus_areas": ["Primary strategic themes identified in the task list"],
      "risk_factors": ["Potential issues or bottlenecks identified"],
      "opportunities": ["Leverage points and growth opportunities"],
      "recommendations": ["Strategic advice for task execution and future planning"]
    }
  }
}

REMEMBER: This is not just task sorting - it's strategic life and career optimization. Every decision should be backed by psychology, strategy, and clear reasoning about what truly matters for the user's success and wellbeing.`;
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
  const prompt = createPrioritizationPrompt(
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
