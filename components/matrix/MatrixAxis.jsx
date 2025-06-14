const MatrixAxis = () => {
  return (
    <>
      {/* Y-axis (vertical line) */}
      <div className="absolute left-1/2 top-6 bottom-6 w-1 bg-gray-800 transform -translate-x-0.5"></div>

      {/* X-axis (horizontal line) */}
      <div className="absolute top-1/2 left-6 right-6 h-1 bg-gray-800 transform -translate-y-0.5"></div>

      {/* Y-axis arrow (top) */}
      <div className="absolute left-1/2 top-4 transform -translate-x-1/2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 12 12"
          className="fill-gray-800"
        >
          <path d="M6 0 L10 6 L8 6 L8 12 L4 12 L4 6 L2 6 Z" />
        </svg>
      </div>

      {/* X-axis arrow (right) */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 12 12"
          className="fill-gray-800"
        >
          <path d="M12 6 L6 2 L6 4 L0 4 L0 8 L6 8 L6 10 Z" />
        </svg>
      </div>

      {/* Origin point */}
      <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-gray-800 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

      {/* Quadrant Labels */}
      {/* DO - Top Right quadrant, positioned near origin */}
      <div className="absolute bottom-1/2 left-1/2 translate-x-1 -translate-y-1 border border-red-700 px-2 py-1 rounded shadow-sm w-28 h-8 flex items-center justify-center">
        <span className="text-base font-extrabold text-red-700">DO</span>
      </div>

      {/* PLAN - Top Left quadrant, positioned near origin */}
      <div className="absolute bottom-1/2 right-1/2 -translate-x-1 -translate-y-1 border border-yellow-700 px-2 py-1 rounded shadow-sm w-28 h-8 flex items-center justify-center">
        <span className="text-base font-extrabold text-yellow-700">PLAN</span>
      </div>

      {/* DELETE - Bottom Left quadrant, positioned near origin */}
      <div className="absolute top-1/2 right-1/2 -translate-x-1 translate-y-1 border border-gray-700 px-2 py-1 rounded shadow-sm w-28 h-8 flex items-center justify-center">
        <span className="text-base font-extrabold text-gray-700">DELETE</span>
      </div>

      {/* DELEGATE - Bottom Right quadrant, positioned near origin */}
      <div className="absolute top-1/2 left-1/2 translate-x-1 translate-y-1 border border-blue-700 px-2 py-1 rounded shadow-sm w-28 h-8 flex items-center justify-center">
        <span className="text-base font-extrabold text-blue-700">DELEGATE</span>
      </div>
    </>
  );
};

export default MatrixAxis;
