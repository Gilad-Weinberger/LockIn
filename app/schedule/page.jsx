"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { scheduleTasks } from "@/lib/functions/taskFunctions";
import { useRouter } from "next/navigation";

const SchedulePage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleResult, setScheduleResult] = useState(null);
  const [scheduleError, setScheduleError] = useState("");

  useEffect(() => {
    if (user) {
      handleSchedule();
    }
  }, [user]);

  const handleSchedule = async () => {
    if (!user) return;

    setIsScheduling(true);
    setScheduleError("");
    setScheduleResult(null);

    try {
      const result = await scheduleTasks(user.uid);
      setScheduleResult(result);
      console.log("AI Scheduling result:", result);
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
              <p className="text-gray-600">AI is analyzing and scheduling your tasks...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          )}

          {scheduleError && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <h3 className="font-semibold mb-2">AI Scheduling Error</h3>
              <p>{scheduleError}</p>
              <button
                onClick={handleSchedule}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Retry AI Scheduling
              </button>
            </div>
          )}

          {scheduleResult && (
            <div className="mb-6 p-6 bg-green-50 border border-green-200 text-green-800 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                AI Scheduling Complete!
              </h3>
              <p className="mb-4">{scheduleResult.message}</p>
              
              {/* AI Reasoning Section */}
              {scheduleResult.reasoning && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                  <h4 className="font-semibold text-blue-800 mb-2">AI Scheduling Strategy</h4>
                  <p className="text-blue-700 text-sm mb-3">
                    {scheduleResult.reasoning.overall_reasoning}
                  </p>
                  
                  {scheduleResult.reasoning.scheduling_summary && (
                    <div className="text-sm text-blue-600">
                      <p><strong>Tasks Scheduled:</strong> {scheduleResult.reasoning.scheduling_summary.total_tasks_scheduled}</p>
                      <p><strong>Time Allocated:</strong> {scheduleResult.reasoning.scheduling_summary.total_time_allocated}</p>
                      <p><strong>Period:</strong> {scheduleResult.reasoning.scheduling_summary.scheduling_period}</p>
                      {scheduleResult.reasoning.scheduling_summary.key_considerations && (
                        <p><strong>Key Factors:</strong> {scheduleResult.reasoning.scheduling_summary.key_considerations.join(", ")}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {scheduleResult.scheduledTasks > 0 && scheduleResult.tasks && (
                <div className="text-left">
                  <h4 className="font-semibold mb-3 text-green-800">
                    Successfully Scheduled {scheduleResult.scheduledTasks} Tasks:
                  </h4>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {scheduleResult.tasks.map((task, index) => (
                      <div
                        key={task.id || index}
                        className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-gray-900">
                            {task.title || `Task ${task.id}`}
                          </h5>
                          {task.priority && (
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              task.priority === 'do' ? 'bg-red-100 text-red-800' :
                              task.priority === 'plan' ? 'bg-yellow-100 text-yellow-800' :
                              task.priority === 'delegate' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {task.priority.toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <p>
                            <strong>Start:</strong> {new Date(task.startDate).toLocaleString()}
                          </p>
                          <p>
                            <strong>End:</strong> {new Date(task.endDate).toLocaleString()}
                          </p>
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
                disabled={isScheduling || !user}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isScheduling || !user
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isScheduling ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
