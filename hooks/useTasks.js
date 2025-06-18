import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  setupTasksListener,
  updateNullPriorityTasks,
} from "@/lib/functions/taskFunctions";

export const useTasks = (filterDone = null) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError("");

    const unsubscribe = setupTasksListener(
      user.uid,
      async ({ tasks, error }) => {
        if (error) {
          setHasError(error);
        } else {
          // Check for tasks with null priority and update them
          const nullPriorityTasks = tasks.filter(
            (task) =>
              (task.priority === null || task.priority === undefined) &&
              !task.isDone
          );

          if (nullPriorityTasks.length > 0) {
            try {
              console.log(
                `Found ${nullPriorityTasks.length} tasks with null priority, updating...`
              );
              await updateNullPriorityTasks(user.uid);
              // Tasks will be updated in real-time via the listener, no need to manually update state
            } catch (updateError) {
              console.error("Error updating null priority tasks:", updateError);
              // Don't fail the entire operation, just log the error
            }
          }

          setTasks(tasks);
        }
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Filter tasks by done status if specified (userId filtering now happens in the query)
  const filteredTasks =
    filterDone === null
      ? tasks
      : tasks.filter((task) => task.isDone === filterDone);

  return { tasks: filteredTasks, isLoading, hasError };
};
