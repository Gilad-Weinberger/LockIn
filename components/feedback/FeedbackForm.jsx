"use client";

import { useState } from "react";
import { addFeatureSuggestion } from "@/lib/functions/feedbackFunctions";

const FeedbackForm = ({ onFeatureAdded }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addFeatureSuggestion(
        title.trim(),
        description.trim()
      );

      if (result.success) {
        setTitle("");
        setDescription("");
        setShowSuccess(true);

        // Hide success message after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);

        // Callback to refresh the list
        if (onFeatureAdded) {
          onFeatureAdded();
        }
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Suggest a feature
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Short, descriptive title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter a brief title for your feature request..."
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            placeholder="Describe your feature request in detail. What problem does it solve? How would it work?"
            required
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !title.trim() || !description.trim()}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:from-blue-500 disabled:hover:to-blue-600"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              Submitting...
            </div>
          ) : (
            "Suggest feature"
          )}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
