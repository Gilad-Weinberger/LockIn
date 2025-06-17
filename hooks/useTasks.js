import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { setupTasksListener } from "@/lib/functions/taskFunctions";

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

    const unsubscribe = setupTasksListener(user.uid, ({ tasks, error }) => {
      if (error) {
        setHasError(error);
      } else {
        setTasks(tasks);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Filter tasks by done status if specified (userId filtering now happens in the query)
  const filteredTasks =
    filterDone === null
      ? tasks
      : tasks.filter((task) => task.isDone === filterDone);

  return { tasks: filteredTasks, isLoading, hasError };
};
