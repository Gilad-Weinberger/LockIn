import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  Timestamp,
} from "firebase/firestore";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  console.log("Scheduling API called");

  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Extract forceReschedule parameter (defaults to false for backward compatibility)
    const { forceReschedule = false } = body;

    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not found in environment variables");
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    // Get all user tasks from Firestore
    const tasksQuery = query(
      collection(db, "tasks"),
      where("userId", "==", userId)
    );

    const tasksSnapshot = await getDocs(tasksQuery);
    const allTasks = tasksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`Found ${allTasks.length} tasks for user`);

    // Filter tasks that need scheduling:
    let tasksToSchedule;

    if (forceReschedule) {
      // Force reschedule: include all non-done tasks (including delete priority)
      tasksToSchedule = allTasks.filter((task) => {
        return !task.isDone;
      });
      console.log(`Force rescheduling ${tasksToSchedule.length} tasks`);
    } else {
      // Normal scheduling: only unscheduled tasks or tasks with updated prioritization (including delete)
      tasksToSchedule = allTasks.filter((task) => {
        // Skip done tasks only
        if (task.isDone) {
          return false;
        }

        // Include tasks that haven't been scheduled yet
        if (!task.startDate || !task.endDate) {
          return true;
        }

        // Include tasks whose prioritization changed after scheduling
        if (task.prioritizedAt && task.scheduledAt) {
          const prioritizedTime = new Date(task.prioritizedAt);
          const scheduledTime = new Date(task.scheduledAt);
          return prioritizedTime > scheduledTime;
        }

        return false;
      });
      console.log(`${tasksToSchedule.length} tasks need scheduling`);
    }

    if (tasksToSchedule.length === 0) {
      return NextResponse.json({
        message: "No tasks need scheduling",
        scheduledTasks: 0,
      });
    }

    // Get existing scheduled tasks for context
    const scheduledTasks = allTasks.filter(
      (task) => task.startDate && task.endDate && !task.isDone
    );

    // Prepare data for AI scheduling
    const tasksForAI = tasksToSchedule.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description || "",
      category: task.category || "",
      type: task.type || "deadline",
      priority: task.priority || "plan",
      inGroupRank: task.inGroupRank || 999,
      taskDate: task.taskDate,
      estimatedDuration: task.estimatedDuration || 60, // Default 1 hour
    }));

    const existingEvents = scheduledTasks.map((task) => ({
      title: task.title,
      startDate: task.startDate,
      endDate: task.endDate,
      priority: task.priority,
    }));

    // Create AI prompt for intelligent scheduling
    const currentDate = new Date();
    const nextMonthDate = new Date(
      currentDate.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    const prompt = `You are a smart scheduling assistant. Schedule the following tasks intelligently based on their priority and existing calendar events.

TASKS TO SCHEDULE:
${JSON.stringify(tasksForAI, null, 2)}

EXISTING SCHEDULED EVENTS:
${JSON.stringify(existingEvents, null, 2)}

SCHEDULING RULES:
1. Current date/time: ${currentDate.toISOString()}
2. Schedule tasks between now and ${nextMonthDate.toISOString()} (FULL MONTH AHEAD)
3. Work hours: 8 AM to 8 PM on Sunday-Thursday, no work on Friday-Saturday
4. **CRITICAL**: "do" tasks must be scheduled as EARLY AS POSSIBLE - start from the very next available time slot
   - If current time is during work hours: schedule in 30 minutes
   - If current time is after work hours: schedule at 8 AM the NEXT WORK DAY
   - NEVER delay "do" tasks unnecessarily - they get absolute priority for the earliest slots
5. **IRON RULE**: 
   - EVENT tasks (type: "event") MUST be scheduled exactly on their taskDate
   - DEADLINE tasks (type: "deadline") MUST be scheduled BEFORE their taskDate (never on or after)
6. Priority order: "do" tasks IMMEDIATELY, then "plan", then "delegate", then "delete"
7. Within same priority, use inGroupRank (lower number = higher priority)
8. Avoid conflicts with existing events
9. Consider estimated duration for each task
10. Leave 30-minute buffers between tasks
11. If current time is late (after 8 PM), start "do" tasks first thing next morning (8 AM)

PRIORITY SCHEDULING LOGIC:
- "do" tasks: Schedule IMMEDIATELY starting from next available time slot (respecting event/deadline rules)
  * CRITICAL: Do NOT delay "do" tasks - they must be scheduled as soon as possible
  * If it's currently 7 PM on June 14th, schedule "do" tasks at 8 AM on June 15th (next work day)
  * Do NOT schedule "do" tasks days or weeks later unless there are specific constraints
- "plan" tasks: Can be scheduled later in the day/week, after all "do" tasks are scheduled
- "delegate" tasks: Schedule after "plan" tasks
- "delete" tasks: Schedule last, but still include them in the schedule

TASK TYPE CONSTRAINTS:
- If task type is "event": Schedule on the exact date specified in taskDate
- If task type is "deadline": Schedule before the date in taskDate (at least 1 day before if possible)

REASONING REQUIREMENTS:
For each task, provide DETAILED reasoning that explains:
- WHY this specific date was chosen
- HOW it fits with the task's priority level
- WHAT constraints influenced the scheduling decision
- HOW it relates to other tasks and existing events

**EXAMPLE FOR "DO" TASKS:**
If current time is June 14th 7:49 PM and there's a "do" task with deadline June 25th:
- CORRECT: Schedule at June 15th 8:00 AM (next available work time)
- WRONG: Schedule at June 24th (unnecessarily delayed)
- Reasoning should explain: "Scheduled immediately at next available work time (June 15th 8 AM) because this is a HIGH PRIORITY 'do' task requiring immediate attention"

For each task, provide:
- startDate: ISO string timestamp
- endDate: ISO string timestamp  
- reasoning: DETAILED explanation of scheduling decision including date selection rationale

Return ONLY valid JSON in this format:
{
  "scheduledTasks": [
    {
      "id": "task_id",
      "startDate": "2024-01-01T09:00:00.000Z",
      "endDate": "2024-01-01T10:00:00.000Z",
      "reasoning": "Detailed explanation: Scheduled on [specific date] because [specific reasons for date choice], considering [priority/constraints/conflicts], positioned after/before [other tasks] due to [priority logic]"
    },
    {
      "id": "task2_id",
      "startDate": "2024-01-01T09:00:00.000Z",
      "endDate": "2024-01-01T10:00:00.000Z",
      "reasoning": "Detailed explanation: Scheduled on [specific date] because [specific reasons for date choice], considering [priority/constraints/conflicts], positioned after/before [other tasks] due to [priority logic]"
    },
  ]
}`;

    let schedulingResult;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log("AI scheduling response received");

      // Parse AI response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in AI response");
      }

      schedulingResult = JSON.parse(jsonMatch[0]);
      console.log(
        `AI scheduled ${schedulingResult.scheduledTasks?.length || 0} tasks`
      );

      // Console.log the complete scheduling result JSON
      console.log("=== SCHEDULING RESULT JSON ===");
      console.log(JSON.stringify(schedulingResult, null, 2));
      console.log("=== END SCHEDULING RESULT ===");
    } catch (aiError) {
      console.error("AI scheduling error:", aiError);

      // Fallback scheduling logic - prioritize "do" tasks for immediate scheduling
      console.log("Using fallback scheduling");
      const fallbackScheduled = [];

      // Determine the earliest possible start time
      const now = new Date(currentDate);
      let earliestStartTime = new Date(now);

      // If it's currently work hours, start in 30 minutes
      if (now.getHours() >= 8 && now.getHours() < 20) {
        earliestStartTime.setMinutes(now.getMinutes() + 30);
      } else {
        // If outside work hours, start at 8 AM the NEXT WORK DAY
        earliestStartTime.setDate(now.getDate() + 1);
        earliestStartTime.setHours(8, 0, 0, 0);

        // Skip to next work day if it's Friday evening or Saturday
        while (
          earliestStartTime.getDay() === 5 ||
          earliestStartTime.getDay() === 6
        ) {
          earliestStartTime.setDate(earliestStartTime.getDate() + 1);
        }
      }

      // Helper function to check if a date is valid for scheduling a task
      const isValidSchedulingDate = (scheduleDate, task) => {
        if (!task.taskDate) return true; // No constraint if no task date

        const taskDate = new Date(task.taskDate);
        const scheduleDay = new Date(scheduleDate);
        scheduleDay.setHours(0, 0, 0, 0);
        taskDate.setHours(0, 0, 0, 0);

        if (task.type === "event") {
          // Events must be scheduled exactly on their task date
          return scheduleDay.getTime() === taskDate.getTime();
        } else if (task.type === "deadline") {
          // Deadlines must be scheduled before their task date
          return scheduleDay.getTime() < taskDate.getTime();
        }

        return true; // Default case
      };

      // Helper function to find next valid scheduling time for a task
      const findNextValidTime = (currentTime, task) => {
        if (!task.taskDate) return new Date(currentTime);

        const taskDate = new Date(task.taskDate);

        if (task.type === "event") {
          // Events must be scheduled on their exact date
          const eventDate = new Date(taskDate);
          eventDate.setHours(8, 0, 0, 0); // Start at 8 AM on event date
          return eventDate;
        } else if (task.type === "deadline") {
          // Deadlines must be before their due date
          const latestDate = new Date(taskDate);
          latestDate.setDate(taskDate.getDate() - 1); // At least 1 day before
          latestDate.setHours(20, 0, 0, 0); // End of work day

          // If current time allows scheduling before deadline, use current time
          if (currentTime <= latestDate) {
            return new Date(currentTime);
          } else {
            // If we're past the valid time, this task cannot be scheduled
            console.warn(
              `Cannot schedule deadline task ${task.id} - past due date`
            );
            return null;
          }
        }

        return new Date(currentTime);
      };

      // Helper function to format date for reasoning
      const formatDateForReasoning = (date) => {
        const options = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        };
        return date.toLocaleDateString("en-US", options);
      };

      // Helper function to generate detailed reasoning
      const generateDetailedReasoning = (
        task,
        startTime,
        position,
        totalTasks
      ) => {
        const formattedDate = formatDateForReasoning(startTime);
        const priorityLevel = task.priority || "unassigned";
        const taskType = task.type || "general";

        let reasoning = `Detailed explanation: Scheduled on ${formattedDate} because `;

        // Priority-based reasoning
        if (priorityLevel === "do") {
          reasoning += `this is a HIGH PRIORITY "DO" task requiring immediate attention. `;
          if (position <= 3) {
            reasoning += `Positioned early in schedule (position ${position}/${totalTasks}) to ensure urgent completion. `;
          }
        } else if (priorityLevel === "plan") {
          reasoning += `this is a "PLAN" task that can be scheduled after urgent tasks. `;
          reasoning += `Positioned at ${position}/${totalTasks} to allow adequate planning time. `;
        } else if (priorityLevel === "delegate") {
          reasoning += `this is a "DELEGATE" task scheduled after higher priority items. `;
          reasoning += `Positioned later (${position}/${totalTasks}) as it can be handled by others. `;
        } else if (priorityLevel === "delete") {
          reasoning += `this is a "DELETE" task scheduled last for review/elimination. `;
          reasoning += `Positioned at end (${position}/${totalTasks}) as lowest priority. `;
        }

        // Task type constraints
        if (taskType === "event") {
          reasoning += `Task type is EVENT, so it MUST be scheduled on its exact date (${task.taskDate}). `;
        } else if (taskType === "deadline") {
          reasoning += `Task type is DEADLINE, so it MUST be completed before ${task.taskDate}. `;
        }

        // Time slot reasoning
        const hour = startTime.getHours();
        if (hour >= 8 && hour < 12) {
          reasoning += `Scheduled in morning hours for optimal productivity. `;
        } else if (hour >= 12 && hour < 17) {
          reasoning += `Scheduled in afternoon to maintain workflow continuity. `;
        } else if (hour >= 17 && hour < 20) {
          reasoning += `Scheduled in evening hours due to earlier time slots being occupied. `;
        }

        // Duration consideration
        const duration = task.estimatedDuration || 60;
        reasoning += `Allocated ${duration} minutes based on estimated task complexity. `;

        // Buffer reasoning
        reasoning += `30-minute buffer included to prevent schedule conflicts and allow transition time.`;

        return reasoning;
      };

      // Sort tasks by priority and inGroupRank - "do" tasks get absolute priority
      // But also consider task type constraints
      const sortedTasks = tasksToSchedule.sort((a, b) => {
        const priorityOrder = { do: 1, plan: 2, delegate: 3, delete: 4 };
        const aPriority = priorityOrder[a.priority] || 5;
        const bPriority = priorityOrder[b.priority] || 5;

        // First sort by priority
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }

        // Then by task type urgency (events and approaching deadlines first)
        const aUrgency = getTaskUrgency(a);
        const bUrgency = getTaskUrgency(b);
        if (aUrgency !== bUrgency) {
          return aUrgency - bUrgency;
        }

        // Finally by inGroupRank
        return (a.inGroupRank || 999) - (b.inGroupRank || 999);
      });

      // Helper function to calculate task urgency
      function getTaskUrgency(task) {
        if (!task.taskDate) return 999; // No urgency if no date

        const taskDate = new Date(task.taskDate);
        const now = new Date(currentDate);
        const daysUntil = Math.ceil((taskDate - now) / (1000 * 60 * 60 * 24));

        if (task.type === "event") {
          return daysUntil; // Events closer to their date are more urgent
        } else if (task.type === "deadline") {
          return daysUntil; // Deadlines closer to due date are more urgent
        }

        return daysUntil;
      }

      let currentScheduleTime = new Date(earliestStartTime);

      for (const task of sortedTasks) {
        // Find the correct time to schedule this task based on its type
        const validTime = findNextValidTime(currentScheduleTime, task);

        if (!validTime) {
          console.warn(
            `Skipping task ${task.id} - cannot find valid scheduling time`
          );
          continue;
        }

        const duration = task.estimatedDuration || 60;
        const startTime = new Date(validTime);
        const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

        fallbackScheduled.push({
          id: task.id,
          startDate: startTime.toISOString(),
          endDate: endTime.toISOString(),
          reasoning: generateDetailedReasoning(
            task,
            startTime,
            sortedTasks.indexOf(task) + 1,
            sortedTasks.length
          ),
        });

        // For non-event tasks, update currentScheduleTime for next task
        if (task.type !== "event") {
          currentScheduleTime = new Date(endTime.getTime() + 15 * 60 * 1000);

          // If we're past work hours (8 PM), move to next day 8 AM
          if (currentScheduleTime.getHours() >= 20) {
            currentScheduleTime.setDate(currentScheduleTime.getDate() + 1);
            currentScheduleTime.setHours(8, 0, 0, 0);
          }

          // Skip Friday evening to Sunday (if it hits Friday 8 PM, move to Sunday 8 AM)
          if (
            currentScheduleTime.getDay() === 5 &&
            currentScheduleTime.getHours() >= 20
          ) {
            currentScheduleTime.setDate(currentScheduleTime.getDate() + 2); // Skip to Sunday
            currentScheduleTime.setHours(8, 0, 0, 0);
          }

          // Skip Saturday entirely (if it's Saturday, move to Sunday)
          if (currentScheduleTime.getDay() === 6) {
            currentScheduleTime.setDate(currentScheduleTime.getDate() + 1); // Move to Sunday
            currentScheduleTime.setHours(8, 0, 0, 0);
          }
        }
      }

      schedulingResult = { scheduledTasks: fallbackScheduled };

      // Console.log the fallback scheduling result JSON
      console.log("=== FALLBACK SCHEDULING RESULT JSON ===");
      console.log(JSON.stringify(schedulingResult, null, 2));
      console.log("=== END FALLBACK SCHEDULING RESULT ===");
    }

    // Update tasks in Firestore with scheduling information
    const batch = writeBatch(db);
    const scheduledAt = new Date().toISOString();

    for (const scheduledTask of schedulingResult.scheduledTasks) {
      const taskRef = doc(db, "tasks", scheduledTask.id);
      batch.update(taskRef, {
        startDate: Timestamp.fromDate(new Date(scheduledTask.startDate)),
        endDate: Timestamp.fromDate(new Date(scheduledTask.endDate)),
        scheduledAt: scheduledAt,
        schedulingReason: scheduledTask.reasoning || "AI scheduled",
      });
    }

    // Commit the batch update
    await batch.commit();
    console.log(
      `Successfully scheduled ${schedulingResult.scheduledTasks.length} tasks`
    );

    return NextResponse.json({
      message: `Successfully scheduled ${schedulingResult.scheduledTasks.length} tasks`,
      scheduledTasks: schedulingResult.scheduledTasks.length,
      tasks: schedulingResult.scheduledTasks,
    });
  } catch (error) {
    console.error("Scheduling error:", error);
    return NextResponse.json(
      { error: `Failed to schedule tasks: ${error.message}` },
      { status: 500 }
    );
  }
}
