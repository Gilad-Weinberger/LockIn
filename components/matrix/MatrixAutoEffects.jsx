"use client";

import { useEffect } from "react";

export const MatrixAutoEffects = ({
  tasks,
  user,
  userData,
  isLoading,
  runAutoPrioritization,
  resetPrioritization,
  hasRunPrioritization,
}) => {
  // Redirect to tasks page if no tasks available
  useEffect(() => {
    if (!isLoading && tasks.length === 0) {
      return;
    }
  }, [tasks, isLoading]);

  // Automatically prioritize tasks when page loads and tasks are available
  useEffect(() => {
    // Only run if we have tasks and user and haven't run before
    if (
      tasks.length > 0 &&
      user &&
      !isLoading &&
      !hasRunPrioritization.current
    ) {
      runAutoPrioritization(userData);
    }
  }, [
    tasks,
    user,
    isLoading,
    userData?.autoPrioritize,
    runAutoPrioritization,
    hasRunPrioritization,
  ]);

  // Reset prioritization flag when user changes or component unmounts
  useEffect(() => {
    return () => {
      resetPrioritization();
    };
  }, [user, resetPrioritization]);

  // This component doesn't render anything
  return null;
};
