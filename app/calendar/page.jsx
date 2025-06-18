"use client";

import { useState, useRef } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/context/AuthContext";
import {
  CalendarLoadingState,
  CalendarScheduler,
  CalendarTaskConverter,
  CalendarKeyboardHandler,
  CalendarNavigationHandler,
  CalendarContainer,
} from "@/components/calendar";
import PageLayout from "@/components/ui/PageLayout";

const CalendarPage = () => {
  const { tasks: allTasks, isLoading, hasError } = useTasks();
  const { user, userData } = useAuth();
  const [view, setView] = useState("month"); // 'month' or 'week'
  const [scheduleError, setScheduleError] = useState("");
  const calendarContainerRef = useRef();

  // Navigation handler
  const navigation = CalendarNavigationHandler({
    initialDate: new Date(),
    onDateChange: (date) => {
      // Optional: Add any additional logic when date changes
    },
  });

  // Scheduler handler
  const scheduler = CalendarScheduler({
    user,
    userData,
    allTasks,
    isLoading,
    onScheduleStart: () => setScheduleError(""),
    onScheduleEnd: () => {},
    onScheduleError: setScheduleError,
  });

  // Filter tasks to show scheduled ones (those with startDate and endDate)
  const scheduledTasks = allTasks.filter(
    (task) => task.startDate && task.endDate
  );

  // Keyboard handlers
  const handleViewMonth = () => setView("month");
  const handleViewWeek = () => setView("week");
  const handlePrevious = () => navigation.handlePrevious(view);
  const handleNext = () => navigation.handleNext(view);
  const handleCloseModal = () => calendarContainerRef.current?.closeModal();

  if (isLoading) {
    return (
      <PageLayout>
        <CalendarLoadingState />
      </PageLayout>
    );
  }

  if (hasError) {
    return (
      <PageLayout>
        <div className="h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center text-red-500 py-8">
            <p>Error loading calendar: {hasError}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Task Conversion Handler */}
      <CalendarTaskConverter
        user={user}
        allTasks={allTasks}
        isLoading={isLoading}
      />

      {/* Keyboard Handler */}
      <CalendarKeyboardHandler
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={navigation.handleToday}
        onViewMonth={handleViewMonth}
        onViewWeek={handleViewWeek}
        onCloseModal={handleCloseModal}
        onManualSchedule={scheduler.handleManualSchedule}
      />

      {/* Calendar Display */}
      <CalendarContainer
        ref={calendarContainerRef}
        currentDate={navigation.currentDate}
        view={view}
        scheduledTasks={scheduledTasks}
        isScheduling={scheduler.isScheduling}
        scheduleError={scheduleError}
        onViewChange={setView}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={navigation.handleToday}
        onSchedule={scheduler.handleManualSchedule}
      />
    </PageLayout>
  );
};

export default CalendarPage;
