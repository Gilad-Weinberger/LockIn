import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Feedback from "@/lib/models/Feedback";

// GET - Read feedback
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const feedbackId = searchParams.get("feedbackId");
    const userId = searchParams.get("userId");

    await connectToDatabase();

    if (feedbackId) {
      // Get a specific feedback item
      const feedback = await Feedback.findById(feedbackId);
      if (!feedback) {
        return NextResponse.json(
          { success: false, message: "Feedback not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: feedback });
    } else {
      // Get all feedback with optional filters
      const query = {};

      if (userId) query.userId = userId;

      const handled = searchParams.get("handled");
      if (handled !== null && handled !== undefined) {
        query.handled = handled === "true";
      }

      const feedback = await Feedback.find(query).sort({ createdAt: -1 });
      return NextResponse.json({ success: true, data: feedback });
    }
  } catch (error) {
    console.error("Error in feedback GET route:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new feedback
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

    const feedback = new Feedback(data);
    const savedFeedback = await feedback.save();

    return NextResponse.json(
      { success: true, data: savedFeedback },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in feedback POST route:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update feedback
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const feedbackId = searchParams.get("feedbackId");
    const data = await request.json();

    if (!feedbackId) {
      return NextResponse.json(
        { success: false, message: "Feedback ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedFeedback) {
      return NextResponse.json(
        { success: false, message: "Feedback not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedFeedback });
  } catch (error) {
    console.error("Error in feedback PUT route:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete feedback
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const feedbackId = searchParams.get("feedbackId");

    if (!feedbackId) {
      return NextResponse.json(
        { success: false, message: "Feedback ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deletedFeedback = await Feedback.findByIdAndDelete(feedbackId);

    if (!deletedFeedback) {
      return NextResponse.json(
        { success: false, message: "Feedback not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    console.error("Error in feedback DELETE route:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
