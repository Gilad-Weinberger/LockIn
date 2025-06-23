"use client";

import { useState, useRef } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/context/AuthContext";
import { useGoogleCalendarConnection } from "@/hooks/useGoogleCalendarConnection";
import { useGoogleCalendarEvents } from "@/hooks/useGoogleCalendarEvents";
import { useAutoSyncTasks } from "@/hooks/useAutoSyncTasks";
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

  // Handle Google Calendar connection completion
  useGoogleCalendarConnection();

  // Auto-sync future tasks to Google Calendar when page loads
  const { isSyncing: isSyncingTasks, syncedTaskIds } = useAutoSyncTasks(
    allTasks,
    user,
    isLoading
  );

  // Navigation handler
  const navigation = CalendarNavigationHandler({
    initialDate: new Date(),
    onDateChange: (date) => {
      // Optional: Add any additional logic when date changes
    },
  });

  // Fetch Google Calendar events
  const {
    events: googleCalendarEvents,
    isLoading: isLoadingEvents,
    error: eventsError,
    refreshEvents,
    refreshSettings,
  } = useGoogleCalendarEvents(navigation.currentDate, view);

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

      {/* Google Calendar Sync Status */}
      {isSyncingTasks && (
        <div className="fixed top-4 right-4 z-50 bg-blue-100 border border-blue-300 rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-800">
              Syncing tasks to Google Calendar...
            </span>
          </div>
        </div>
      )}

      {/* Sync Success Notification */}
      {!isSyncingTasks && syncedTaskIds.length > 0 && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-300 rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <svg
              className="h-4 w-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-green-800">
              {syncedTaskIds.length} task{syncedTaskIds.length !== 1 ? "s" : ""}{" "}
              synced to Google Calendar
            </span>
          </div>
        </div>
      )}

      {/* Calendar Display */}
      <CalendarContainer
        ref={calendarContainerRef}
        currentDate={navigation.currentDate}
        view={view}
        scheduledTasks={scheduledTasks}
        googleCalendarEvents={googleCalendarEvents}
        isScheduling={scheduler.isScheduling}
        scheduleError={scheduleError}
        onViewChange={setView}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={navigation.handleToday}
        onSchedule={scheduler.handleManualSchedule}
        onRefreshGoogleCalendar={refreshEvents}
        onRefreshGoogleCalendarSettings={refreshSettings}
      />
    </PageLayout>
  );
};

export default CalendarPage;
