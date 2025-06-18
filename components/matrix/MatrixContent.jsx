"use client";

import {
  MatrixContainer,
  MatrixLoadingState,
  MatrixErrorState,
  MatrixEmptyState,
  MatrixErrorBanner,
  MatrixLegend,
} from "@/components/matrix";
import { NavigationButton } from "@/components/ui/Icons";

export const MatrixContent = ({
  tasks,
  isLoading,
  hasError,
  isPrioritizing,
  prioritizedTasks,
  prioritizeError,
  onTaskMove,
  onRetry,
  onRePrioritize,
}) => {
  // Loading state
  if (isLoading || isPrioritizing) {
    return (
      <MatrixLoadingState
        isLoading={isLoading}
        isPrioritizing={isPrioritizing}
      />
    );
  }

  // Error state
  if (hasError) {
    return <MatrixErrorState error={hasError} />;
  }

  // No tasks state
  if (tasks.length === 0) {
    return <MatrixEmptyState />;
  }

  // Success state - render the matrix
  return (
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
        <MatrixErrorBanner error={prioritizeError} onRetry={onRetry} />
        <MatrixLegend
          isPrioritizing={isPrioritizing}
          onRePrioritize={onRePrioritize}
        />
        <MatrixContainer
          tasks={tasks}
          prioritizedTasks={prioritizedTasks}
          onTaskMove={onTaskMove}
        />
      </div>
    </div>
  );
};
