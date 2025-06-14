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
      console.log("Scheduling result:", result);
    } catch (error) {
      console.error("Scheduling error:", error);
      setScheduleError(error.message);
    } finally {
      setIsScheduling(false);
    }
  };

  const goToCalendar = () => {
    router.push("/calendar");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Task Scheduler
          </h1>

          {isScheduling && (
            <div className="mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Scheduling your tasks...</p>
            </div>
          )}

          {scheduleError && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <h3 className="font-semibold mb-2">Scheduling Error</h3>
              <p>{scheduleError}</p>
              <button
                onClick={handleSchedule}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Retry Scheduling
              </button>
            </div>
          )}

          {scheduleResult && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              <h3 className="font-semibold mb-2">Scheduling Complete!</h3>
              <p>{scheduleResult.message}</p>
              {scheduleResult.scheduledTasks > 0 && (
                <div className="mt-4">
                  <p className="font-medium">
                    Successfully scheduled {scheduleResult.scheduledTasks} tasks
                  </p>
                  {scheduleResult.tasks && (
                    <div className="mt-4 text-left">
                      <h4 className="font-semibold mb-2">Scheduled Tasks:</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {scheduleResult.tasks.map((task, index) => (
                          <div
                            key={task.id || index}
                            className="p-2 bg-white rounded border"
                          >
                            <p className="font-medium">Task ID: {task.id}</p>
                            <p className="text-sm">
                              Start: {new Date(task.startDate).toLocaleString()}
                            </p>
                            <p className="text-sm">
                              End: {new Date(task.endDate).toLocaleString()}
                            </p>
                            {task.reasoning && (
                              <p className="text-xs text-gray-600 mt-1">
                                Reason: {task.reasoning}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-x-4">
            <button
              onClick={handleSchedule}
              disabled={isScheduling || !user}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isScheduling || !user
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isScheduling ? "Scheduling..." : "Schedule Tasks"}
            </button>

            <button
              onClick={goToCalendar}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              View Calendar
            </button>
          </div>

          {!user && (
            <div className="mt-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
              <p>Please sign in to schedule your tasks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
