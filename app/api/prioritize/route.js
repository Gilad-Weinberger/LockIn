import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase";
import { doc, updateDoc, writeBatch } from "firebase/firestore";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  console.log("Prioritize API called");

  try {
    // Better request body parsing with error handling
    let tasks, userId;
    try {
      const body = await request.json();
      tasks = body.tasks;
      userId = body.userId;
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    console.log("Request data:", {
      tasksCount: tasks?.length,
      userId: userId?.substring(0, 8) + "...",
    });

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      console.log("No tasks provided");
      return NextResponse.json({ error: "No tasks provided" }, { status: 400 });
    }

    if (!userId) {
      console.log("No userId provided");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Filter only undone tasks for the specified user that haven't been prioritized yet
    const undoneTasks = tasks.filter(
      (task) =>
        !task.isDone &&
        task.userId === userId &&
        (task.priority === null || task.priority === undefined)
    );

    // Get all tasks (including already prioritized ones) for the response
    const allUserTasks = tasks.filter(
      (task) => !task.isDone && task.userId === userId
    );

    console.log("Tasks filtered:", {
      total: tasks.length,
      userTasks: allUserTasks.length,
      unprioritized: undoneTasks.length,
    });

    if (undoneTasks.length === 0) {
      console.log("No unprioritized tasks, returning existing priorities");
      // If no unprioritized tasks, return existing priorities
      const existingPriorities = {
        do: allUserTasks
          .filter((task) => task.priority === "do")
          .map((task) => task.id),
        plan: allUserTasks
          .filter((task) => task.priority === "plan")
          .map((task) => task.id),
        delegate: allUserTasks
          .filter((task) => task.priority === "delegate")
          .map((task) => task.id),
        delete: allUserTasks
          .filter((task) => task.priority === "delete")
          .map((task) => task.id),
      };

      return NextResponse.json(existingPriorities);
    }

    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not found in environment variables");
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    // Pre-process events: automatically categorize them before AI processing
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today for comparison

    const eventTasks = undoneTasks.filter((task) => task.type === "event");
    const nonEventTasks = undoneTasks.filter((task) => task.type !== "event");

    // Categorize events automatically
    const eventsForDo = [];
    const eventsForPlan = [];

    eventTasks.forEach((task) => {
      if (task.taskDate) {
        const taskDate = new Date(task.taskDate);
        taskDate.setHours(0, 0, 0, 0);

        if (taskDate.getTime() === today.getTime()) {
          // Event is today - goes to DO
          eventsForDo.push(task.id);
        } else {
          // Event is not today - goes to PLAN
          eventsForPlan.push(task.id);
        }
      } else {
        // Event without date - goes to PLAN by default
        eventsForPlan.push(task.id);
      }
    });

    console.log(
      `Pre-categorized events: ${eventsForDo.length} to DO, ${eventsForPlan.length} to PLAN`
    );

    // Only send non-event tasks to AI for prioritization
    const tasksForAI = nonEventTasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description || "",
      category: task.category || "",
      type: task.type || "deadline",
      dueDate: task.taskDate,
      isCompleted: task.isDone || false,
    }));

    console.log("Sending to AI:", tasksForAI.length, "non-event tasks");

    const prompt = `You are a productivity expert helping to categorize tasks using the Eisenhower Matrix (Do, Plan, Delegate, Delete). 

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

For DO and PLAN categories, return the task IDs sorted by priority within each group (first task ID = highest priority, second = second highest, etc.).

Return ONLY a valid JSON object in this exact format:
{
  "do": ["highest_priority_id", "second_priority_id"],
  "plan": ["highest_priority_id", "second_priority_id"],
  "delegate": ["id5"],
  "delete": ["id6"]
}

Make sure all task IDs are distributed across the four categories and every task ID appears exactly once. For DO and PLAN tasks, order them by urgency, importance, and due dates.`;

    let prioritizedTasks;

    // If there are no non-event tasks to process, skip AI and use empty categories
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
    } else {
      // Process non-event tasks with AI
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("AI response received, length:", text.length);

        // Parse the AI response
        try {
          // Clean the response to extract JSON
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error("No valid JSON found in AI response");
          }
          prioritizedTasks = JSON.parse(jsonMatch[0]);
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
      }
    }

    // Merge pre-categorized events with AI results
    prioritizedTasks.do = [...eventsForDo, ...(prioritizedTasks.do || [])];
    prioritizedTasks.plan = [
      ...eventsForPlan,
      ...(prioritizedTasks.plan || []),
    ];

    console.log("Final prioritization after merging events:", prioritizedTasks);

    // Validate that all tasks are categorized
    const allCategorizedIds = [
      ...(prioritizedTasks.do || []),
      ...(prioritizedTasks.plan || []),
      ...(prioritizedTasks.delegate || []),
      ...(prioritizedTasks.delete || []),
    ];

    const originalTaskIds = undoneTasks.map((task) => task.id);
    const missingIds = originalTaskIds.filter(
      (id) => !allCategorizedIds.includes(id)
    );

    // Add any missing tasks to the "plan" category
    if (missingIds.length > 0) {
      prioritizedTasks.plan = [...(prioritizedTasks.plan || []), ...missingIds];
      console.log("Added missing tasks to plan:", missingIds);
    }

    // Update each task in the database with its priority
    console.log("Updating database with priorities...");
    try {
      const batch = writeBatch(db);

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
      // Continue anyway, return the prioritization even if DB update fails
    }

    // Combine new priorities with existing ones for the response
    const finalPriorities = {
      do: [
        ...allUserTasks
          .filter((task) => task.priority === "do")
          .map((task) => task.id),
        ...(prioritizedTasks.do || []),
      ],
      plan: [
        ...allUserTasks
          .filter((task) => task.priority === "plan")
          .map((task) => task.id),
        ...(prioritizedTasks.plan || []),
      ],
      delegate: [
        ...allUserTasks
          .filter((task) => task.priority === "delegate")
          .map((task) => task.id),
        ...(prioritizedTasks.delegate || []),
      ],
      delete: [
        ...allUserTasks
          .filter((task) => task.priority === "delete")
          .map((task) => task.id),
        ...(prioritizedTasks.delete || []),
      ],
    };

    console.log(
      `Prioritized ${undoneTasks.length} new tasks, returning combined results`
    );
    return NextResponse.json(finalPriorities);
  } catch (error) {
    console.error("Prioritization error:", error);
    return NextResponse.json(
      { error: `Failed to prioritize tasks: ${error.message}` },
      { status: 500 }
    );
  }
}
