"use client";

import { useState } from "react";

const CalendarNavigationHandler = ({
  initialDate = new Date(),
  onDateChange,
}) => {
  const [currentDate, setCurrentDate] = useState(initialDate);

  const handlePrevious = (view) => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const handleNext = (view) => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateChange?.(today);
  };

  return {
    currentDate,
    handlePrevious,
    handleNext,
    handleToday,
    setCurrentDate,
  };
};

export default CalendarNavigationHandler;
