const TaskFormActions = ({
  isLoading,
  isGoogleCalendarEvent,
  userData,
  categories,
  hasError,
}) => {
  const getButtonText = () => {
    if (isLoading) return "Saving...";
    if (isGoogleCalendarEvent) return "Update Google Calendar Event";
    if (!userData) return "Loading...";
    return "Save Task";
  };

  const isDisabled = () => {
    return (
      isLoading ||
      (!isGoogleCalendarEvent && (!userData || categories.length === 0))
    );
  };

  return (
    <>
      <button
        type="submit"
        className={`w-full py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed ${
          isGoogleCalendarEvent
            ? "bg-purple-600 text-white hover:bg-purple-700"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
        disabled={isDisabled()}
      >
        {getButtonText()}
      </button>
      
      {hasError && <p className="text-red-500 text-sm">{hasError}</p>}
    </>
  );
};

export default TaskFormActions; 