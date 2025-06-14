"use client";

import { useRouter } from "next/navigation";

const MatrixEmptyState = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">
          No tasks found.
        </p>
        <button
          onClick={() => router.push("/tasks")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
        >
          Go to Tasks
        </button>
      </div>
    </div>
  );
};

export default MatrixEmptyState;
