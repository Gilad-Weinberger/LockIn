"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/context/AuthContext";
import {
  MatrixContainer,
  MatrixLoadingState,
  MatrixErrorState,
  MatrixEmptyState,
  MatrixErrorBanner,
  MatrixLegend,
} from "@/components/matrix";
import { NavigationButton } from "@/components/ui/Icons";
import PageLayout from "@/components/ui/PageLayout";
import {
  getTasksExcludingDelete,
  haveTasksChanged,
  storeCurrentTasksHash,
  prioritizeTasks,
  updatePrioritizedTasksState,
} from "@/lib/functions/taskFunctions";

const MatrixPage = () => {
  const { tasks, isLoading, hasError } = useTasks(false); // Only get undone tasks
  const { user } = useAuth();
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [prioritizedTasks, setPrioritizedTasks] = useState(null);
  const [prioritizeError, setPrioritizeError] = useState("");
  const hasRunPrioritization = useRef(false);

  // Redirect to tasks page if no tasks available
  useEffect(() => {
    if (!isLoading && tasks.length === 0) {
      return;
    }
  }, [tasks, isLoading]);

  // Automatically prioritize tasks when page loads and tasks are available
  useEffect(() => {
    const prioritizeTasksAsync = async () => {
      // Don't proceed if no user, no tasks, still loading, already prioritizing, or already ran
      if (
        !user ||
        !tasks.length ||
        isLoading ||
        isPrioritizing ||
        hasRunPrioritization.current
      ) {
        return;
      }

      // Check if tasks have changed since last prioritization (excluding delete tasks)
      if (!haveTasksChanged(tasks, user.uid)) {
        console.log(
          "Tasks haven't changed since last prioritization, skipping API call"
        );
        // Set prioritized tasks from existing data
        const existingPriorities = {
          do: tasks
            .filter((task) => task.priority === "do")
            .map((task) => task.id),
          plan: tasks
            .filter((task) => task.priority === "plan")
            .map((task) => task.id),
          delegate: tasks
            .filter((task) => task.priority === "delegate")
            .map((task) => task.id),
          delete: tasks
            .filter((task) => task.priority === "delete")
            .map((task) => task.id),
        };
        setPrioritizedTasks(existingPriorities);
        hasRunPrioritization.current = true;
        return;
      }

      // Get tasks excluding delete priority for prioritization
      const tasksToReprioritize = getTasksExcludingDelete(tasks);

      if (tasksToReprioritize.length === 0) {
        console.log("No tasks to reprioritize (excluding delete priority)");
        hasRunPrioritization.current = true;
        return;
      }

      console.log("Tasks have changed, starting reprioritization...", {
        userCount: user ? 1 : 0,
        totalTasksCount: tasks.length,
        tasksToReprioritizeCount: tasksToReprioritize.length,
      });

      hasRunPrioritization.current = true; // Mark as started
      setIsPrioritizing(true);
      setPrioritizeError("");

      try {
        const result = await prioritizeTasks(tasksToReprioritize, user.uid);
        console.log("Prioritization result:", result);

        // Include existing delete tasks in the final result
        const existingDeleteTasks = tasks
          .filter((task) => task.priority === "delete")
          .map((task) => task.id);

        const finalResult = {
          ...result,
          delete: existingDeleteTasks,
        };

        setPrioritizedTasks(finalResult);

        // Store the current tasks hash after successful prioritization
        storeCurrentTasksHash(tasks, user.uid);
      } catch (error) {
        console.error("Prioritization error:", error);
        setPrioritizeError(`Failed to prioritize tasks: ${error.message}`);
        hasRunPrioritization.current = false; // Reset on error to allow retry
      } finally {
        setIsPrioritizing(false);
      }
    };

    // Only run if we have tasks and user and haven't run before
    if (
      tasks.length > 0 &&
      user &&
      !isLoading &&
      !hasRunPrioritization.current
    ) {
      prioritizeTasksAsync();
    }
  }, [tasks, user, isLoading]); // Removed isPrioritizing from dependencies

  // Reset prioritization flag when user changes or component unmounts
  useEffect(() => {
    return () => {
      hasRunPrioritization.current = false;
    };
  }, [user]);

  // Handle task movement between quadrants or within quadrants (optimized)
  const handleTaskMove = useCallback(
    (taskId, newPriority, newInGroupRank) => {
      console.log(
        `Task ${taskId} moved to ${newPriority} with inGroupRank priority ${newInGroupRank}`
      );

      // Update the prioritizedTasks state to reflect the move
      if (prioritizedTasks) {
        setPrioritizedTasks((prevState) =>
          updatePrioritizedTasksState(prevState, taskId, newPriority)
        );
      }

      // The useTasks hook will automatically update due to Firestore real-time updates
      // No need to manually update local state
    },
    [prioritizedTasks]
  );

  // Handle retry for prioritization errors
  const handleRetry = () => {
    setPrioritizeError("");
    hasRunPrioritization.current = false; // Allow retry
  };

  // Handle manual re-prioritization
  const handleRePrioritize = async () => {
    if (!user || !tasks.length || isPrioritizing) return;

    setIsPrioritizing(true);
    setPrioritizeError("");
    hasRunPrioritization.current = false; // Reset to allow re-prioritization

    try {
      // Force re-prioritization of ALL tasks
      const result = await prioritizeTasks(tasks, user.uid);
      console.log("Manual re-prioritization result:", result);

      // Extract reasoning if available, otherwise use existing format
      let finalResult;
      if (result.reasoning) {
        // New format with reasoning
        const { reasoning, ...prioritizationData } = result;
        finalResult = prioritizationData;
      } else {
        // Old format without reasoning
        finalResult = result;
      }

      setPrioritizedTasks(finalResult);

      // Store the current tasks hash after successful prioritization
      storeCurrentTasksHash(tasks, user.uid);
      hasRunPrioritization.current = true;
    } catch (error) {
      console.error("Manual re-prioritization error:", error);
      setPrioritizeError(`Failed to re-prioritize tasks: ${error.message}`);
    } finally {
      setIsPrioritizing(false);
    }
  };

  // Loading state
  if (isLoading || isPrioritizing) {
    return (
      <PageLayout>
        <MatrixLoadingState
          isLoading={isLoading}
          isPrioritizing={isPrioritizing}
        />
      </PageLayout>
    );
  }

  // Error state
  if (hasError) {
    return (
      <PageLayout>
        <MatrixErrorState error={hasError} />
      </PageLayout>
    );
  }

  // No tasks state (should redirect, but show this as fallback)
  if (tasks.length === 0) {
    return (
      <PageLayout>
        <MatrixEmptyState />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="h-full bg-gray-100 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Navigation buttons */}
        <NavigationButton
          direction="left"
          destination="/tasks"
          position="left"
          ariaLabel="Back to tasks"
        />
        <NavigationButton
          direction="right"
          destination="/calendar"
          position="right"
          ariaLabel="Go to calendar view"
        />

        <div className="max-w-5xl w-full flex gap-6 items-center justify-center">
          <MatrixErrorBanner error={prioritizeError} onRetry={handleRetry} />
          <MatrixLegend
            isPrioritizing={isPrioritizing}
            onRePrioritize={handleRePrioritize}
          />
          <MatrixContainer
            tasks={tasks}
            prioritizedTasks={prioritizedTasks}
            onTaskMove={handleTaskMove}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default MatrixPage;
