"use client";

import { useState, useRef } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/context/AuthContext";
import { useGoogleCalendarConnection } from "@/hooks/useGoogleCalendarConnection";
import { useGoogleCalendarIntegration } from "@/hooks/useGoogleCalendarIntegration";
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

  // Navigation handler
  const navigation = CalendarNavigationHandler({
    initialDate: new Date(),
    onDateChange: (date) => {
      // Optional: Add any additional logic when date changes
    },
  });

  // Use our new Google Calendar integration with auto-sync
  const {
    googleEvents,
    isLoading: googleCalendarIsLoading,
    isSyncing: isSyncingTasks,
    settings,
    syncAllTasks,
    getTasksToSync,
  } = useGoogleCalendarIntegration(allTasks, navigation.currentDate, view);

  // Track how many tasks need syncing for UI feedback
  const tasksToSync = getTasksToSync();
  const syncedTaskIds = []; // This will be handled automatically by the integration

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
      {settings.connected && settings.autoSync && (
        <>
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

          {/* Manual Sync Button - Show if there are tasks to sync */}
          {!isSyncingTasks && tasksToSync.length > 0 && (
            <div className="fixed top-4 right-4 z-50 bg-yellow-100 border border-yellow-300 rounded-lg p-3 shadow-lg">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-yellow-800">
                  {tasksToSync.length} task{tasksToSync.length !== 1 ? "s" : ""}{" "}
                  ready to sync
                </span>
                <button
                  onClick={syncAllTasks}
                  className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 transition-colors"
                >
                  Sync Now
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Calendar Display */}
      <CalendarContainer
        ref={calendarContainerRef}
        currentDate={navigation.currentDate}
        view={view}
        scheduledTasks={scheduledTasks}
        isScheduling={scheduler.isScheduling}
        scheduleError={scheduleError}
        googleCalendarIsLoading={googleCalendarIsLoading}
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
