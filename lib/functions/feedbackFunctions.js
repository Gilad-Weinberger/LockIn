import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  getUserSubscriptionLevel,
  SUBSCRIPTION_LEVELS,
} from "@/lib/utils/subscription-utils";

// Collection names
const FEEDBACK_COLLECTION = "feedback";

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

    // Get user's subscription status at the time of feedback creation
    const userSubscriptionLevel = await getUserSubscriptionLevel(userId);

    const docRef = await addDoc(collection(db, FEEDBACK_COLLECTION), {
      title: title.trim(),
      description: description.trim(),
      userId: userId, // Store the actual user ID who created this feedback
      votes: [], // Initialize as empty array of user IDs who voted
      handled: false,
      subscriptionPlan: userSubscriptionLevel, // Store the user's subscription plan when they created the feedback
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding feature suggestion:", error);
    return { success: false, error: error.message };
  }
};

// Get all feedback items with optional filtering
export const getFeedbackItems = async (handledFilter = null, limit = null) => {
  try {
    let feedbackQuery = collection(db, FEEDBACK_COLLECTION);

    if (handledFilter !== null) {
      feedbackQuery = query(
        feedbackQuery,
        where("handled", "==", handledFilter)
      );
    }

    // Order by creation date - we'll handle sorting by vote count in JavaScript
    feedbackQuery = query(feedbackQuery, orderBy("createdAt", "desc"));

    if (limit) {
      feedbackQuery = query(feedbackQuery, limit(limit));
    }

    const querySnapshot = await getDocs(feedbackQuery);
    const feedbackItems = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      feedbackItems.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        voteCount: Array.isArray(data.votes) ? data.votes.length : 0,
      });
    });

    return { success: true, data: feedbackItems };
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

    const feedbackRef = doc(db, FEEDBACK_COLLECTION, feedbackId);

    // Get current document to check if user already voted
    const docSnap = await getDoc(feedbackRef);

    if (docSnap.exists()) {
      const currentVotes = docSnap.data().votes || [];

      if (!currentVotes.includes(userId)) {
        const newVotes = [...currentVotes, userId];
        await updateDoc(feedbackRef, {
          votes: newVotes,
          updatedAt: serverTimestamp(),
        });
        return { success: true };
      } else {
        return { success: false, error: "User has already voted" };
      }
    }

    return { success: false, error: "Document not found" };
  } catch (error) {
    console.error("Error voting for feature:", error);
    return { success: false, error: error.message };
  }
};

// Toggle vote for a feature (add userId if not present, remove if present)
export const toggleVoteForFeature = async (feedbackId, userId) => {
  try {
    // Validate that user is logged in
    if (!userId || userId === "anonymous") {
      return { success: false, error: "User must be logged in to vote" };
    }

    const feedbackRef = doc(db, FEEDBACK_COLLECTION, feedbackId);

    // Get current document to check if user already voted
    const docSnap = await getDoc(feedbackRef);

    if (docSnap.exists()) {
      const currentVotes = docSnap.data().votes || [];
      let newVotes;
      let action;

      if (currentVotes.includes(userId)) {
        // User has voted, remove their vote
        newVotes = currentVotes.filter((vote) => vote !== userId);
        action = "removed";
      } else {
        // User hasn't voted, add their vote
        newVotes = [...currentVotes, userId];
        action = "added";
      }

      await updateDoc(feedbackRef, {
        votes: newVotes,
        updatedAt: serverTimestamp(),
      });

      return { success: true, action };
    }

    return { success: false, error: "Document not found" };
  } catch (error) {
    console.error("Error toggling vote for feature:", error);
    return { success: false, error: error.message };
  }
};

// Update feedback handled status (admin function)
export const updateFeedbackStatus = async (feedbackId, isHandled) => {
  try {
    const feedbackRef = doc(db, FEEDBACK_COLLECTION, feedbackId);
    await updateDoc(feedbackRef, {
      handled: isHandled,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating feedback status:", error);
    return { success: false, error: error.message };
  }
};

// Delete feedback (only by the user who created it)
export const deleteFeedback = async (feedbackId, userId) => {
  try {
    // Validate that user is logged in
    if (!userId || userId === "anonymous") {
      return {
        success: false,
        error: "User must be logged in to delete feedback",
      };
    }

    const feedbackRef = doc(db, FEEDBACK_COLLECTION, feedbackId);

    // Get the document first to verify ownership
    const docSnap = await getDoc(feedbackRef);

    if (!docSnap.exists()) {
      return { success: false, error: "Feedback not found" };
    }

    const feedbackData = docSnap.data();

    // Check if the user is the owner of the feedback
    if (feedbackData.userId !== userId) {
      return { success: false, error: "You can only delete your own feedback" };
    }

    // Delete the document
    await deleteDoc(feedbackRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting feedback:", error);
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
