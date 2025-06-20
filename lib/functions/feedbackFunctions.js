import {
  createFeedbackApi,
  getAllFeedback,
  getFeedbackById,
  updateFeedbackApi,
} from "./dbApi";

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

    const feedback = await createFeedbackApi({
      title: title.trim(),
      description: description.trim(),
      userId: userId, // Store the actual user ID who created this feedback
      votes: [], // Initialize as empty array of user IDs who voted
      handled: false,
    });

    return { success: true, id: feedback._id.toString() };
  } catch (error) {
    console.error("Error adding feature suggestion:", error);
    return { success: false, error: error.message };
  }
};

// Get all feedback items with optional filtering
export const getFeedbackItems = async (handledFilter = null, limit = null) => {
  try {
    const filters = {};

    if (handledFilter !== null) {
      filters.handled = handledFilter;
    }

    const feedbackItems = await getAllFeedback(filters);

    // Sort by creation date in descending order (most recent first)
    const sortedItems = feedbackItems.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Apply limit if specified
    const limitedItems = limit ? sortedItems.slice(0, limit) : sortedItems;

    const formattedItems = limitedItems.map((feedback) => ({
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

    try {
      // Check if user already voted
      const feedback = await getFeedbackById(feedbackId);
      const currentVotes = feedback.votes || [];

      if (!currentVotes.includes(userId)) {
        // Add this user's vote
        await updateFeedbackApi(feedbackId, {
          votes: [...currentVotes, userId],
          updatedAt: new Date(),
        });
        return { success: true };
      } else {
        return { success: false, error: "User has already voted" };
      }
    } catch (error) {
      if (error.message.includes("not found")) {
        return { success: false, error: "Feedback not found" };
      }
      throw error;
    }
  } catch (error) {
    console.error("Error voting for feature:", error);
    return { success: false, error: error.message };
  }
};

// Update feedback handled status (admin function)
export const updateFeedbackStatus = async (feedbackId, isHandled) => {
  try {
    await updateFeedbackApi(feedbackId, {
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
