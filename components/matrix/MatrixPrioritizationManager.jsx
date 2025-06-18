"use client";

import { useState, useRef, useCallback } from "react";
import {
  getTasksExcludingDelete,
  haveTasksChanged,
  storeCurrentTasksHash,
  prioritizeTasks,
  updatePrioritizedTasksState,
  updateNullPriorityTasks,
} from "@/lib/functions/taskFunctions";

export const usePrioritizationManager = (tasks, user) => {
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [prioritizedTasks, setPrioritizedTasks] = useState(null);
  const [prioritizeError, setPrioritizeError] = useState("");
  const hasRunPrioritization = useRef(false);

  // Handle task movement between quadrants
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
    },
    [prioritizedTasks]
  );

  // Handle retry for prioritization errors
  const handleRetry = useCallback(() => {
    setPrioritizeError("");
    hasRunPrioritization.current = false;
  }, []);

  // Handle manual re-prioritization
  const handleRePrioritize = useCallback(async () => {
    if (!user || !tasks.length || isPrioritizing) return;

    setIsPrioritizing(true);
    setPrioritizeError("");
    hasRunPrioritization.current = false;

    try {
      const result = await prioritizeTasks(tasks, user.uid);
      console.log("Manual re-prioritization result:", result);

      if (result.limitMessage) {
        setPrioritizeError(
          `✅ Tasks prioritized successfully! ${result.limitMessage}`
        );
      }

      // Extract reasoning if available, otherwise use existing format
      let finalResult;
      if (result.reasoning) {
        const { reasoning, ...prioritizationData } = result;
        finalResult = prioritizationData;
      } else {
        finalResult = result;
      }

      setPrioritizedTasks(finalResult);
      storeCurrentTasksHash(tasks, user.uid);
      hasRunPrioritization.current = true;
    } catch (error) {
      console.error("Manual re-prioritization error:", error);
      setPrioritizeError(`Failed to re-prioritize tasks: ${error.message}`);
    } finally {
      setIsPrioritizing(false);
    }
  }, [user, tasks, isPrioritizing]);

  // Auto-prioritization logic
  const runAutoPrioritization = useCallback(
    async (userData) => {
      // Don't proceed if conditions not met
      if (
        !user ||
        !tasks.length ||
        isPrioritizing ||
        hasRunPrioritization.current ||
        userData?.autoPrioritize === false
      ) {
        return;
      }

      // Check if tasks have changed since last prioritization
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

        // Handle null priority tasks
        const nullPriorityTasks = tasks.filter(
          (task) =>
            (task.priority === null || task.priority === undefined) &&
            !task.isDone
        );

        if (nullPriorityTasks.length > 0) {
          try {
            console.log(
              `Found ${nullPriorityTasks.length} tasks with null priority during existing prioritization, updating...`
            );
            await updateNullPriorityTasks(user.uid);
            existingPriorities.plan = [
              ...existingPriorities.plan,
              ...nullPriorityTasks.map((task) => task.id),
            ];
          } catch (updateError) {
            console.error("Error updating null priority tasks:", updateError);
          }
        }

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

      hasRunPrioritization.current = true;
      setIsPrioritizing(true);
      setPrioritizeError("");

      try {
        const result = await prioritizeTasks(tasksToReprioritize, user.uid);
        console.log("Prioritization result:", result);

        if (result.limitMessage) {
          setPrioritizeError(
            `✅ Tasks prioritized successfully! ${result.limitMessage}`
          );
        }

        // Include existing delete tasks in the final result
        const existingDeleteTasks = tasks
          .filter((task) => task.priority === "delete")
          .map((task) => task.id);

        const finalResult = {
          ...result,
          delete: existingDeleteTasks,
        };

        setPrioritizedTasks(finalResult);
        storeCurrentTasksHash(tasks, user.uid);
      } catch (error) {
        console.error("Prioritization error:", error);
        setPrioritizeError(`Failed to prioritize tasks: ${error.message}`);
        hasRunPrioritization.current = false;
      } finally {
        setIsPrioritizing(false);
      }
    },
    [tasks, user, isPrioritizing]
  );

  // Reset prioritization flag
  const resetPrioritization = useCallback(() => {
    hasRunPrioritization.current = false;
  }, []);

  return {
    // State
    isPrioritizing,
    prioritizedTasks,
    prioritizeError,
    hasRunPrioritization,

    // Actions
    handleTaskMove,
    handleRetry,
    handleRePrioritize,
    runAutoPrioritization,
    resetPrioritization,
  };
};
