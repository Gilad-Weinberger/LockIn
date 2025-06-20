import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Task from "@/lib/models/Task";

// GET - Read tasks
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");
    const userId = searchParams.get("userId");

    await connectToDatabase();

    if (taskId) {
      // Get a specific task
      const task = await Task.findById(taskId);
      if (!task) {
        return NextResponse.json(
          { success: false, message: "Task not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: task });
    } else if (userId) {
      // Get all tasks for a specific user
      const query = { userId };

      // Add optional filters
      const category = searchParams.get("category");
      const isDone = searchParams.get("isDone");
      const priority = searchParams.get("priority");
      const taskDate = searchParams.get("taskDate");

      if (category) query.category = category;
      if (isDone !== null && isDone !== undefined)
        query.isDone = isDone === "true";
      if (priority) query.priority = priority;
      if (taskDate) query.taskDate = taskDate;

      const tasks = await Task.find(query).sort({ createdAt: -1 });
      return NextResponse.json({ success: true, data: tasks });
    } else {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in tasks GET route:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new task
export async function POST(request) {
  try {
    const data = await request.json();

    if (!data.userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const task = new Task(data);
    const savedTask = await task.save();

    return NextResponse.json(
      { success: true, data: savedTask },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in tasks POST route:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update a task
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");
    const data = await request.json();

    if (!taskId) {
      return NextResponse.json(
        { success: false, message: "Task ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error("Error in tasks PUT route:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a task
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { success: false, message: "Task ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Error in tasks DELETE route:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
