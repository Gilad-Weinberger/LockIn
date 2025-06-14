"use client";

const MatrixDropZone = ({
  index,
  quadrantType,
  onTaskDrop,
  isFirst = false,
  isLast = false,
}) => {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.opacity = "1";
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.style.opacity = "0";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const taskData = JSON.parse(e.dataTransfer.getData("text/plain"));
    if (taskData.priority === quadrantType) {
      onTaskDrop(e, index);
    }
    e.currentTarget.style.opacity = "0";
  };

  // Don't render drop zone before first task (index 0) unless it's the last drop zone
  if (isFirst && !isLast) return null;

  return (
    <div
      className="h-2 -mt-1 -mb-1 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Removed the blue line indicator */}
    </div>
  );
};

export default MatrixDropZone;
