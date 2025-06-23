const HeroHeadline = ({ isVisible }) => {
  return (
    <div className="mb-6 sm:mb-8">
      <h1
        className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight transform transition-all duration-1000 delay-200 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        Your{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600">
          Task List
        </span>{" "}
        becomes a<br className="hidden sm:block" />
        <span className="sm:hidden"> </span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600">
          Booked Calendar
        </span>{" "}
        in 10 seconds.
      </h1>

      <p
        className={`text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0 transform transition-all duration-1000 delay-400 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        Just add your tasks, and our AI instantly prioritizes and schedules them
        perfectly for you.
      </p>
    </div>
  );
};

export default HeroHeadline;
