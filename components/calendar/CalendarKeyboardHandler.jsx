"use client";

import { useEffect } from "react";

const CalendarKeyboardHandler = ({
  onPrevious,
  onNext,
  onToday,
  onViewMonth,
  onViewWeek,
  onCloseModal,
  onManualSchedule,
}) => {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        onPrevious();
      } else if (e.key === "ArrowRight") {
        onNext();
      } else if (e.key === "t") {
        onToday();
      } else if (e.key === "m") {
        onViewMonth();
      } else if (e.key === "w") {
        onViewWeek();
      } else if (e.key === "Escape") {
        onCloseModal();
      } else if (e.key === "s" && e.ctrlKey) {
        e.preventDefault();
        onManualSchedule();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    onPrevious,
    onNext,
    onToday,
    onViewMonth,
    onViewWeek,
    onCloseModal,
    onManualSchedule,
  ]);

  // This component doesn't render anything, it just handles keyboard events
  return null;
};

export default CalendarKeyboardHandler;
