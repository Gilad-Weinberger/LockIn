const MatrixLegend = () => {
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
    </div>
  );
};

export default MatrixLegend;
