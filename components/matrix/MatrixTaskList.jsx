"use client";

import MatrixTaskCard from "./MatrixTaskCard";
import MatrixDropZone from "./MatrixDropZone";

const MatrixTaskList = ({
  tasks,
  quadrantType,
  accentColor,
  onTaskDragStart,
  onTaskDrop,
}) => {
  return (
    <>
      {tasks.map((task, index) => (
        <div key={`${task.id}-container`}>
          {/* Drop zone before each task (except first) */}
          {index > 0 && (
            <MatrixDropZone
              index={index}
              quadrantType={quadrantType}
              onTaskDrop={onTaskDrop}
              isFirst={false}
            />
          )}

          <MatrixTaskCard
            task={task}
            index={index}
            quadrantType={quadrantType}
            accentColor={accentColor}
            onDragStart={onTaskDragStart}
          />
        </div>
      ))}

      {/* Drop zone after all tasks */}
      {tasks.length > 0 && (
        <MatrixDropZone
          index={tasks.length}
          quadrantType={quadrantType}
          onTaskDrop={onTaskDrop}
          isLast={true}
        />
      )}
    </>
  );
};

export default MatrixTaskList;
