const TaskFormHeader = ({ isGoogleCalendarEvent, onClose }) => {
  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className="absolute top-1 right-3 text-gray-400 hover:text-gray-700 text-3xl font-bold focus:outline-none cursor-pointer"
        aria-label="Close"
      >
        ×
      </button>
      
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold">
          {isGoogleCalendarEvent
            ? "Edit Google Calendar Event"
            : "Edit Scheduled Task"}
        </h2>
        {isGoogleCalendarEvent && (
          <span className="inline-block w-3 h-3 bg-purple-500 rounded-full"></span>
        )}
      </div>
    </>
  );
};

export default TaskFormHeader; 