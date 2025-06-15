const MatrixLegend = ({ onRePrioritize, isPrioritizing = false }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-[18px] py-5 border flex-shrink-0">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">
        Eisenhower Matrix
      </h3>
      <div className="space-y-4 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-red-200 border border-red-300 rounded flex-shrink-0"></div>
          <div>
            <div className="font-semibold">DO</div>
            <div className="text-gray-600">Important & Urgent</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-yellow-200 border border-yellow-300 rounded flex-shrink-0"></div>
          <div>
            <div className="font-semibold">PLAN</div>
            <div className="text-gray-600">Important & Not Urgent</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-blue-200 border border-blue-300 rounded flex-shrink-0"></div>
          <div>
            <div className="font-semibold">DELEGATE</div>
            <div className="text-gray-600">Not Important & Urgent</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gray-200 border border-gray-300 rounded flex-shrink-0"></div>
          <div>
            <div className="font-semibold">DELETE</div>
            <div className="text-gray-600">Not Important & Not Urgent</div>
          </div>
        </div>
      </div>

      {/* Re-prioritize Button */}
      {onRePrioritize && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onRePrioritize}
            disabled={isPrioritizing}
            className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isPrioritizing ? (
              <>
                <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Re-prioritizing...
              </>
            ) : (
              <>
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Re-prioritize
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default MatrixLegend;
