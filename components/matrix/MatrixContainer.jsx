"use client";

import MatrixAxis from "./MatrixAxis";
import MatrixGrid from "./MatrixGrid";

const MatrixContainer = ({ tasks, prioritizedTasks, onTaskMove }) => {
  return (
    <div className="relative bg-white rounded-lg shadow-lg p-6 h-[650px] w-[830px] flex-shrink-0">
      {/* Matrix Axes */}
      <MatrixAxis />
      {/* Matrix Grid */}
      <MatrixGrid
        tasks={tasks}
        prioritizedTasks={prioritizedTasks}
        onTaskMove={onTaskMove}
      />
    </div>
  );
};

export default MatrixContainer;
