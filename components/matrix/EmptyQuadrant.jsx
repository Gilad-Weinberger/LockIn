"use client";

const EmptyQuadrant = ({ emptyMessage }) => {
  return (
    <div className="flex items-center justify-center text-center text-xs opacity-60 py-8 border-2 border-dashed border-gray-300 rounded-lg h-full">
      <div>
        {emptyMessage}
        <br />
        <span className="text-xs text-gray-400">Drop tasks here</span>
      </div>
    </div>
  );
};

export default EmptyQuadrant;
