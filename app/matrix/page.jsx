"use client";

import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/context/AuthContext";
import {
  usePrioritizationManager,
  MatrixAutoEffects,
  MatrixContent,
} from "@/components/matrix";
import PageLayout from "@/components/ui/PageLayout";

const MatrixPage = () => {
  const { tasks, isLoading, hasError } = useTasks(false); // Only get undone tasks
  const { user, userData } = useAuth();

  // Use the prioritization manager hook
  const {
    isPrioritizing,
    prioritizedTasks,
    prioritizeError,
    hasRunPrioritization,
    handleTaskMove,
    handleRetry,
    handleRePrioritize,
    runAutoPrioritization,
    resetPrioritization,
  } = usePrioritizationManager(tasks, user);

  return (
    <PageLayout>
      {/* Handle automatic effects */}
      <MatrixAutoEffects
        tasks={tasks}
        user={user}
        userData={userData}
        isLoading={isLoading}
        runAutoPrioritization={runAutoPrioritization}
        resetPrioritization={resetPrioritization}
        hasRunPrioritization={hasRunPrioritization}
      />

      {/* Render content based on state */}
      <MatrixContent
        tasks={tasks}
        isLoading={isLoading}
        hasError={hasError}
        isPrioritizing={isPrioritizing}
        prioritizedTasks={prioritizedTasks}
        prioritizeError={prioritizeError}
        onTaskMove={handleTaskMove}
        onRetry={handleRetry}
        onRePrioritize={handleRePrioritize}
      />
    </PageLayout>
  );
};

export default MatrixPage;
