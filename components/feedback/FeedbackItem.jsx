"use client";

import { useState } from "react";
import {
  voteForFeature,
  updateFeedbackStatus,
} from "@/lib/functions/feedbackFunctions";

const FeedbackItem = ({
  feedback,
  onVoteUpdate,
  currentUserId = null,
  isAdmin,
}) => {
  const [isVoting, setIsVoting] = useState(false);
  const [isTogglingHandled, setIsTogglingHandled] = useState(false);

  // Check if user is logged in and has voted
  const isLoggedIn = currentUserId && currentUserId !== "anonymous";
  const hasVoted =
    Array.isArray(feedback.votes) &&
    currentUserId &&
    feedback.votes.includes(currentUserId);
  const voteCount = Array.isArray(feedback.votes) ? feedback.votes.length : 0;

  const handleVote = async () => {
    // Prevent voting if user is not logged in or has already voted
    if (isVoting || hasVoted || !isLoggedIn) return;

    setIsVoting(true);

    try {
      const result = await voteForFeature(feedback.id, currentUserId);

      if (result.success) {
        if (onVoteUpdate) {
          onVoteUpdate(feedback.id);
        }
      }
    } catch (error) {
      console.error("Error voting for feature:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleToggleHandled = async () => {
    if (isTogglingHandled) return;

    setIsTogglingHandled(true);

    try {
      const result = await updateFeedbackStatus(feedback.id, !feedback.handled);

      if (result.success) {
        if (onVoteUpdate) {
          onVoteUpdate(feedback.id);
        }
      }
    } catch (error) {
      console.error("Error toggling handled status:", error);
    } finally {
      setIsTogglingHandled(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays <= 7) return `${diffDays}d ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}w ago`;

    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-3">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {feedback.title}
            </h3>
            {feedback.handled && (
              <span className="px-2 py-1 text-xs font-medium rounded-full border bg-green-50 text-green-600 border-green-200">
                Handled
              </span>
            )}
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
            {feedback.description}
          </p>

          <div className="flex items-center text-xs text-gray-500">
            <span>{formatDate(feedback.createdAt)}</span>
          </div>
        </div>

        {/* Admin Controls + Vote Button */}
        <div className="flex items-center ml-6 mt-2 space-x-3">
          {/* Admin Toggle - Only visible to admins */}
          {isAdmin && (
            <div className="flex flex-col items-center">
              <button
                onClick={handleToggleHandled}
                disabled={isTogglingHandled}
                className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px] ${
                  feedback.handled
                    ? "bg-green-50 text-green-600 hover:bg-green-100"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                } ${
                  isTogglingHandled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105 active:scale-95"
                }`}
                title={
                  feedback.handled ? "Mark as not handled" : "Mark as handled"
                }
              >
                {isTogglingHandled ? (
                  <svg
                    className="w-4 h-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : feedback.handled ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
              <span className="text-xs text-gray-500 mt-1">
                {feedback.handled ? "Handled" : "Pending"}
              </span>
            </div>
          )}

          {/* Vote Button */}
          <button
            onClick={handleVote}
            disabled={isVoting || hasVoted || !isLoggedIn}
            className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-200 min-w-[53px] ${
              hasVoted
                ? "bg-blue-50 text-blue-600 cursor-default"
                : !isLoggedIn
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:scale-105 active:scale-95"
            } ${isVoting ? "opacity-50 cursor-not-allowed" : ""}`}
            title={
              !isLoggedIn
                ? "Login to vote for this feature"
                : hasVoted
                ? "Already voted"
                : "Vote for this feature"
            }
          >
            {isVoting ? (
              <svg
                className="w-5 h-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
                  hasVoted ? "scale-110" : ""
                }`}
                fill={hasVoted ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            )}
            <span className="text-sm font-bold mt-1">{voteCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackItem;
