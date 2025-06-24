import { useState, useEffect, useMemo } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  addFeatureSuggestion,
  toggleVoteForFeature,
  updateFeedbackStatus,
  deleteFeedback,
} from "@/lib/functions/feedbackFunctions";

const FEEDBACK_COLLECTION = "feedback";

export const useFeedback = (activeFilter = "recent", showHandled = false) => {
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    let feedbackQuery = collection(db, FEEDBACK_COLLECTION);

    // Order by creation date (we'll handle other sorting in JavaScript)
    feedbackQuery = query(feedbackQuery, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      feedbackQuery,
      (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            voteCount: Array.isArray(data.votes) ? data.votes.length : 0,
          });
        });

        setFeedbackItems(items);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error in feedback onSnapshot:", error);
        setError(error.message);
        setIsLoading(false);
      }
    );

    // Cleanup function
    return () => unsubscribe();
  }, []);

  // Filter and sort items based on current filter and show handled setting
  const filteredAndSortedItems = useMemo(() => {
    let items = [...feedbackItems];

    // First filter by handled status
    if (!showHandled) {
      items = items.filter((item) => item.handled !== true);
    }

    // Then sort based on the active filter
    if (activeFilter === "recent") {
      // Sort by creation date (most recent first)
      items.sort((a, b) => b.createdAt - a.createdAt);
    } else if (activeFilter === "wanted") {
      // Sort by vote count (most voted first), then by creation date
      items.sort((a, b) => {
        if (a.voteCount === b.voteCount) {
          return b.createdAt - a.createdAt; // Most recent first for ties
        }
        return b.voteCount - a.voteCount; // Higher votes first
      });
    }

    return items;
  }, [feedbackItems, activeFilter, showHandled]);

  // Function to submit new feedback
  const submitFeedback = async (title, description, userId) => {
    try {
      const result = await addFeatureSuggestion(title, description, userId);
      return result;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      return { success: false, error: error.message };
    }
  };

  // Function to toggle vote for feedback with optimistic updates
  const toggleVoteForFeedback = async (feedbackId, userId) => {
    if (!userId || userId === "anonymous") {
      return { success: false, error: "User must be logged in to vote" };
    }

    // Find the feedback item in current raw state
    const feedbackIndex = feedbackItems.findIndex(
      (item) => item.id === feedbackId
    );
    if (feedbackIndex === -1) {
      return { success: false, error: "Feedback item not found" };
    }

    const currentFeedback = feedbackItems[feedbackIndex];
    const currentVotes = Array.isArray(currentFeedback.votes)
      ? currentFeedback.votes
      : [];
    const hasVoted = currentVotes.includes(userId);

    // Optimistically update the UI immediately
    const newVotes = hasVoted
      ? currentVotes.filter((vote) => vote !== userId)
      : [...currentVotes, userId];

    const updatedFeedback = {
      ...currentFeedback,
      votes: newVotes,
      voteCount: newVotes.length,
    };

    // Create a backup of the current state for potential rollback
    const previousState = [...feedbackItems];

    // Update local state immediately for instant UI response
    const newFeedbackItems = [...feedbackItems];
    newFeedbackItems[feedbackIndex] = updatedFeedback;
    setFeedbackItems(newFeedbackItems);

    // Perform database update in background
    try {
      const result = await toggleVoteForFeature(feedbackId, userId);

      if (!result.success) {
        // Revert optimistic update on failure
        setFeedbackItems(previousState);
        console.error("Error toggling vote for feedback:", result.error);
        return result;
      }

      return result;
    } catch (error) {
      // Revert optimistic update on error
      setFeedbackItems(previousState);
      console.error("Error toggling vote for feedback:", error);
      return { success: false, error: error.message };
    }
  };

  // Function to update feedback status (admin only)
  const updateFeedback = async (feedbackId, isHandled) => {
    try {
      const result = await updateFeedbackStatus(feedbackId, isHandled);
      return result;
    } catch (error) {
      console.error("Error updating feedback:", error);
      return { success: false, error: error.message };
    }
  };

  // Function to delete feedback (only by the user who created it)
  const deleteFeedbackItem = async (feedbackId, userId) => {
    try {
      const result = await deleteFeedback(feedbackId, userId);
      return result;
    } catch (error) {
      console.error("Error deleting feedback:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    feedbackItems: filteredAndSortedItems,
    allFeedbackItems: feedbackItems,
    isLoading,
    error,
    submitFeedback,
    toggleVoteForFeedback,
    updateFeedback,
    deleteFeedbackItem,
  };
};
