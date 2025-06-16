const HeroBadge = ({ isVisible }) => {
  return (
    <div
      className={`inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-8 transform transition-all duration-1000 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      }`}
    >
      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
      AI-Powered Task Scheduling
    </div>
  );
};

export default HeroBadge; 