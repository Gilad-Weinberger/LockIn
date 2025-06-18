const CalendarModalFooter = ({ onClose }) => {
  return (
    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CalendarModalFooter; 