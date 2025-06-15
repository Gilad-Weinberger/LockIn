"use client";

import { useState, useEffect } from "react";
import TaskForm from "@/components/tasks/TaskForm";
import TaskList from "@/components/tasks/TaskList";
import { NavigationButton } from "@/components/ui/Icons";
import PageLayout from "@/components/ui/PageLayout";

const Page = () => {
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Keyboard shortcut: '=' toggles the form
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "=") {
        e.preventDefault(); // Prevent the "=" from being typed
        setOpen((prev) => !prev);
        if (open) setSelectedTask(null);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
        setSelectedTask(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setOpen(true);
  };

  return (
    <PageLayout>
      <div className="h-full bg-gray-100 relative flex flex-col overflow-hidden">
        {/* Navigation buttons */}
        <NavigationButton
          direction="right"
          destination="/matrix"
          position="right"
          ariaLabel="Go to matrix view"
        />

        {open && (
          <div
            className="fixed inset-0 z-40 backdrop-blur-sm pointer-events-none transition-all"
            aria-hidden="true"
          />
        )}

        {/* Scrollable task list area */}
        <div className="flex-1 overflow-y-auto py-8">
          <TaskList onEdit={handleEditTask} />
        </div>

        <TaskForm
          open={open}
          onClose={() => {
            setOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
        />
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="fixed bottom-20 right-8 z-50 w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl shadow-lg hover:bg-blue-700 transition focus:outline-none"
          aria-label={open ? "Close form" : "Add task"}
        >
          {open ? "×" : "+"}
        </button>
      </div>
    </PageLayout>
  );
};

export default Page;
