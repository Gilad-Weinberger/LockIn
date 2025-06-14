"use client";

import { useState, useEffect } from "react";
import TaskForm from "@/components/tasks/TaskForm";
import TaskList from "@/components/tasks/TaskList";
import { NavigationButton } from "@/components/ui/Icons";
import LogoutButton from "@/components/ui/LogoutButton";

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
    <div className="min-h-screen bg-gray-100 py-8 relative">
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
      <TaskList onEdit={handleEditTask} />
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
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl shadow-lg hover:bg-blue-700 transition focus:outline-none"
        aria-label={open ? "Close form" : "Add task"}
      >
        {open ? "×" : "+"}
      </button>
      <LogoutButton />
    </div>
  );
};

export default Page;
