"use client";

import { useState, useEffect } from "react";
import FeedbackItem from "./FeedbackItem";
import { getFeedbackItems } from "@/lib/functions/feedbackFunctions";

const FeedbackList = ({
  activeFilter,
  showHandled,
  refreshTrigger,
  onStatsUpdate,
}) => {
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFeedbackItems = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getFeedbackItems();

      if (result.success) {
        setFeedbackItems(result.data);

        // Calculate and send stats to parent
        if (onStatsUpdate) {
          const stats = {
            total: result.data.length,
            handled: result.data.filter((item) => item.handled === true).length,
            pending: result.data.filter((item) => item.handled === false)
              .length,
          };
          onStatsUpdate(stats);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to load feedback items");
      console.error("Error loading feedback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbackItems();
  }, [refreshTrigger]);

  const handleVoteUpdate = (feedbackId) => {
    // Refresh the entire list to get updated vote counts
    loadFeedbackItems();
  };

  // Filter and sort items based on current filter and show handled setting
  const getFilteredAndSortedItems = () => {
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
  };

  const filteredItems = getFilteredAndSortedItems();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-6 bg-gray-200 rounded w-48"></div>
                  <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="ml-6">
                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Failed to load feedback
        </h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={loadFeedbackItems}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    const getEmptyMessage = () => {
      if (feedbackItems.length === 0) {
        return {
          title: "No feedback yet",
          message: "Be the first to suggest a feature!",
        };
      }

      if (activeFilter === "recent") {
        return {
          title: "No recent items",
          message: showHandled
            ? "No items found."
            : "No unhandled items found.",
        };
      }

      if (activeFilter === "wanted") {
        return {
          title: "No popular items",
          message: showHandled
            ? "No items found."
            : "No unhandled items found.",
        };
      }

      return {
        title: "No items found",
        message: "Try adjusting your filters or submit a new feature request.",
      };
    };

    const emptyState = getEmptyMessage();

    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v8a2 2 0 002 2h6a2 2 0 002-2V8M9 12h6"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {emptyState.title}
        </h3>
        <p className="text-gray-500">{emptyState.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredItems.map((feedback) => (
        <FeedbackItem
          key={feedback.id}
          feedback={feedback}
          onVoteUpdate={handleVoteUpdate}
        />
      ))}
    </div>
  );
};

export default FeedbackList;
