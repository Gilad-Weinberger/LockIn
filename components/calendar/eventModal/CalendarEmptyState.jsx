import { CalendarIcon } from "./CalendarIcons";

const CalendarEmptyState = () => {
  return (
    <div className="text-center py-8 text-gray-500">
      <CalendarIcon />
      <p className="mt-2">No tasks scheduled for this day</p>
    </div>
  );
};

export default CalendarEmptyState; 