import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { setupTasksListener } from "@/lib/functions/taskFunctions";

export const useTasks = (filterDone = null) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    setIsLoading(true);
    setHasError("");

    const unsubscribe = setupTasksListener(({ tasks, error }) => {
      if (error) {
        setHasError(error);
      } else {
        setTasks(tasks);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter tasks by user and optionally by done status
  const userTasks = user
    ? tasks.filter((task) => {
        const isUserTask = task.userId === user.uid;
        if (filterDone === null) return isUserTask;
        return isUserTask && task.isDone === filterDone;
      })
    : [];

  return { tasks: userTasks, isLoading, hasError };
};
