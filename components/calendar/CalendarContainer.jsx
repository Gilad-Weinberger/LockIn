"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import {
  CalendarHeader,
  CalendarMonthView,
  CalendarWeekView,
  CalendarEventModal,
} from "@/components/calendar";
import { NavigationButton } from "@/components/ui/Icons";

const CalendarContainer = forwardRef(
  (
    {
      currentDate,
      view,
      scheduledTasks,
      googleCalendarEvents = [],
      isScheduling,
      scheduleError,
      onViewChange,
      onPrevious,
      onNext,
      onToday,
      onSchedule,
      onRefreshGoogleCalendar,
    },
    ref
  ) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDateClick = (date) => {
      setSelectedDate(date);
      setIsModalOpen(true);
    };

    const handleCloseModal = () => {
      setIsModalOpen(false);
    };

    // Expose methods to parent components
    useImperativeHandle(ref, () => ({
      closeModal: handleCloseModal,
    }));

    return (
      <div className="h-full bg-gray-100 relative flex flex-col overflow-hidden">
        {/* Navigation buttons */}
        <NavigationButton
          direction="left"
          destination="/matrix"
          position="left"
          ariaLabel="Back to matrix view"
        />

        {/* Scheduling error indicator */}
        {scheduleError && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm max-w-xs">
              Scheduling error: {scheduleError}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col p-4 min-h-0">
          <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
            {/* Calendar container as one block */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden flex-1 flex flex-col min-h-0">
              <CalendarHeader
                currentDate={currentDate}
                view={view}
                onViewChange={onViewChange}
                onPrevious={onPrevious}
                onNext={onNext}
                onToday={onToday}
                onSchedule={onSchedule}
                isScheduling={isScheduling}
              />

              {/* Calendar view without gap */}
              <div className="flex-1 overflow-hidden min-h-0">
                {view === "month" ? (
                  <CalendarMonthView
                    currentDate={currentDate}
                    tasks={scheduledTasks}
                    googleCalendarEvents={googleCalendarEvents}
                    onDateClick={handleDateClick}
                  />
                ) : (
                  <CalendarWeekView
                    currentDate={currentDate}
                    tasks={scheduledTasks}
                    googleCalendarEvents={googleCalendarEvents}
                    onDateClick={handleDateClick}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <CalendarEventModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          selectedDate={selectedDate}
          tasks={scheduledTasks}
          googleCalendarEvents={googleCalendarEvents}
          onRefreshGoogleCalendar={onRefreshGoogleCalendar}
        />
      </div>
    );
  }
);

CalendarContainer.displayName = "CalendarContainer";

export default CalendarContainer;
