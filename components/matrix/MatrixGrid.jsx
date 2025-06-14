import { useMemo } from "react";
import MatrixQuadrant from "./MatrixQuadrant";
import {
  getTasksByQuadrant,
  QUADRANT_CONFIGS,
} from "@/lib/functions/taskFunctions";

const MatrixGrid = ({ tasks, prioritizedTasks, onTaskMove }) => {
  // Memoize quadrant data to prevent unnecessary re-computations
  const quadrants = useMemo(
    () =>
      QUADRANT_CONFIGS.map((config) => ({
        ...config,
        tasks: getTasksByQuadrant(tasks, prioritizedTasks, config.quadrantType),
      })),
    [tasks, prioritizedTasks]
  );

  return (
    <div className="absolute inset-6 grid grid-cols-2 grid-rows-2 gap-1">
      {quadrants.map((quadrant, index) => (
        <MatrixQuadrant
          key={quadrant.quadrantType}
          {...quadrant}
          onTaskMove={onTaskMove}
        />
      ))}
    </div>
  );
};

export default MatrixGrid;
