import connectToDatabase from "@/lib/mongodb";
import Feedback from "@/lib/models/Feedback";

// Add new feedback/feature suggestion
export const addFeatureSuggestion = async (
  title,
  description,
  userId = null
) => {
  try {
    // Validate required fields
    if (!title || !description) {
      return { success: false, error: "Title and description are required" };
    }

    // Validate that user is logged in
    if (!userId || userId === "anonymous") {
      return {
        success: false,
        error: "User must be logged in to create feedback",
      };
    }

    await connectToDatabase();

    const newFeedback = new Feedback({
      title: title.trim(),
      description: description.trim(),
      userId: userId, // Store the actual user ID who created this feedback
      votes: [], // Initialize as empty array of user IDs who voted
      handled: false,
    });

    const savedFeedback = await newFeedback.save();
    return { success: true, id: savedFeedback._id.toString() };
  } catch (error) {
    console.error("Error adding feature suggestion:", error);
    return { success: false, error: error.message };
  }
};

// Get all feedback items with optional filtering
export const getFeedbackItems = async (handledFilter = null, limit = null) => {
  try {
    await connectToDatabase();

    let query = {};

    if (handledFilter !== null) {
      query.handled = handledFilter;
    }

    let feedbackQuery = Feedback.find(query).sort({ createdAt: -1 });

    if (limit) {
      feedbackQuery = feedbackQuery.limit(limit);
    }

    const feedbackItems = await feedbackQuery.exec();

    const formattedItems = feedbackItems.map((feedback) => ({
      id: feedback._id.toString(),
      title: feedback.title,
      description: feedback.description,
      userId: feedback.userId,
      votes: feedback.votes,
      handled: feedback.handled,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
      voteCount: Array.isArray(feedback.votes) ? feedback.votes.length : 0,
    }));

    return { success: true, data: formattedItems };
  } catch (error) {
    console.error("Error fetching feedback items:", error);
    return { success: false, error: error.message };
  }
};

// Vote for a feature (add userId to votes array if not already present)
export const voteForFeature = async (feedbackId, userId) => {
  try {
    // Validate that user is logged in
    if (!userId || userId === "anonymous") {
      return { success: false, error: "User must be logged in to vote" };
    }

    await connectToDatabase();

    // Check if user already voted
    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return { success: false, error: "Feedback not found" };
    }

    const currentVotes = feedback.votes || [];

    if (!currentVotes.includes(userId)) {
      const updatedFeedback = await Feedback.findByIdAndUpdate(
        feedbackId,
        {
          $push: { votes: userId },
          updatedAt: new Date(),
        },
        { new: true }
      );
      return { success: true };
    } else {
      return { success: false, error: "User has already voted" };
    }
  } catch (error) {
    console.error("Error voting for feature:", error);
    return { success: false, error: error.message };
  }
};

// Update feedback handled status (admin function)
export const updateFeedbackStatus = async (feedbackId, isHandled) => {
  try {
    await connectToDatabase();

    await Feedback.findByIdAndUpdate(feedbackId, {
      handled: isHandled,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating feedback status:", error);
    return { success: false, error: error.message };
  }
};

// Get feedback statistics
export const getFeedbackStats = async () => {
  try {
    const allFeedback = await getFeedbackItems();
    if (!allFeedback.success) {
      return allFeedback;
    }

    const stats = {
      total: allFeedback.data.length,
      handled: allFeedback.data.filter((item) => item.handled === true).length,
      pending: allFeedback.data.filter((item) => item.handled === false).length,
      totalVotes: allFeedback.data.reduce(
        (sum, item) => sum + (item.voteCount || 0),
        0
      ),
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error getting feedback statistics:", error);
    return { success: false, error: error.message };
  }
};
