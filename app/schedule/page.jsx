"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { scheduleTasks } from "@/lib/functions/taskFunctions";
import { useRouter } from "next/navigation";
import { getAISchedulingTokensLeft } from "@/lib/plans/freePlanFeatures";
import { getUserSubscriptionLevel } from "@/lib/utils/subscription-utils";

const SchedulePage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleResult, setScheduleResult] = useState(null);
  const [scheduleError, setScheduleError] = useState("");
  const [tokensLeft, setTokensLeft] = useState(null);
  const [subscriptionLevel, setSubscriptionLevel] = useState(null);

  useEffect(() => {
    if (user) {
      handleSchedule();
      fetchTokenInfo();
    }
  }, [user]);

  const fetchTokenInfo = async () => {
    if (!user) return;

    try {
      const level = await getUserSubscriptionLevel(user.uid);
      setSubscriptionLevel(level);

      if (level === "free") {
        const tokens = await getAISchedulingTokensLeft(user.uid);
        setTokensLeft(tokens);
      }
    } catch (error) {
      console.error("Error fetching token info:", error);
    }
  };

  const handleSchedule = async () => {
    if (!user) return;

    setIsScheduling(true);
    setScheduleError("");
    setScheduleResult(null);

    try {
      const result = await scheduleTasks(user.uid);
      setScheduleResult(result);
      console.log("AI Scheduling result:", result);

      // Refresh token info after scheduling
      if (subscriptionLevel === "free") {
        await fetchTokenInfo();
      }
    } catch (error) {
      console.error("AI Scheduling error:", error);
      setScheduleError(error.message);
    } finally {
      setIsScheduling(false);
    }
  };

  const goToCalendar = () => {
    router.push("/calendar");
  };

  const goToSettings = () => {
    router.push("/settings");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI Task Scheduler
            </h1>
            <p className="text-gray-600">
              Intelligent scheduling powered by AI to optimize your productivity
            </p>
          </div>

          {isScheduling && (
            <div className="mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                AI is analyzing and scheduling your tasks...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This may take a few moments
              </p>
            </div>
          )}

          {scheduleError && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <h3 className="font-semibold mb-2">AI Scheduling Error</h3>
              <p>{scheduleError}</p>
              <button
                onClick={handleSchedule}
                disabled={subscriptionLevel === "free" && tokensLeft === 0}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Retry AI Scheduling
              </button>
            </div>
          )}

          {scheduleResult && (
            <div className="mb-6 p-6 bg-green-50 border border-green-200 text-green-800 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                AI Scheduling Complete!
              </h3>
              <p className="mb-4">{scheduleResult.message}</p>

              {/* AI Reasoning Section */}
              {scheduleResult.reasoning && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    AI Scheduling Strategy
                  </h4>
                  <p className="text-blue-700 text-sm mb-3">
                    {scheduleResult.reasoning.overall_reasoning}
                  </p>

                  {scheduleResult.reasoning.scheduling_summary && (
                    <div className="text-sm text-blue-600">
                      <p>
                        <strong>Tasks Scheduled:</strong>{" "}
                        {
                          scheduleResult.reasoning.scheduling_summary
                            .total_tasks_scheduled
                        }
                      </p>
                      <p>
                        <strong>Time Allocated:</strong>{" "}
                        {
                          scheduleResult.reasoning.scheduling_summary
                            .total_time_allocated
                        }
                      </p>
                      <p>
                        <strong>Period:</strong>{" "}
                        {
                          scheduleResult.reasoning.scheduling_summary
                            .scheduling_period
                        }
                      </p>
                      {scheduleResult.reasoning.scheduling_summary
                        .key_considerations && (
                        <p>
                          <strong>Key Factors:</strong>{" "}
                          {scheduleResult.reasoning.scheduling_summary.key_considerations.join(
                            ", "
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Scheduled Tasks List */}
              {scheduleResult.tasks && scheduleResult.tasks.length > 0 && (
                <div className="text-left">
                  <h4 className="font-semibold mb-3">Scheduled Tasks:</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {scheduleResult.tasks.map((task, index) => (
                      <div
                        key={task.id || index}
                        className="bg-white p-3 rounded border border-green-300"
                      >
                        <div className="font-medium text-gray-900 mb-1">
                          {task.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>
                            Start: {new Date(task.startDate).toLocaleString()}
                          </div>
                          <div>
                            End: {new Date(task.endDate).toLocaleString()}
                          </div>
                          {task.priority && (
                            <div className="mt-1">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {task.priority.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {task.reasoning && (
                          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                            <strong>AI Reasoning:</strong> {task.reasoning}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleSchedule}
                disabled={
                  isScheduling ||
                  !user ||
                  (subscriptionLevel === "free" && tokensLeft === 0)
                }
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isScheduling ||
                  !user ||
                  (subscriptionLevel === "free" && tokensLeft === 0)
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isScheduling ? (
                  <span className="flex items-center">
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
                    AI Scheduling...
                  </span>
                ) : (
                  "🤖 Schedule with AI"
                )}
              </button>

              <button
                onClick={goToCalendar}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                📅 View Calendar
              </button>
            </div>

            {subscriptionLevel === "free" && tokensLeft === 0 && (
              <p className="text-sm text-gray-500 text-center">
                Upgrade to Pro for unlimited AI scheduling operations
              </p>
            )}

            <div className="text-center">
              <button
                onClick={goToSettings}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                ⚙️ Customize AI Scheduling Rules
              </button>
            </div>
          </div>

          {!user && (
            <div className="mt-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
              <p>Please sign in to use AI-powered task scheduling.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
