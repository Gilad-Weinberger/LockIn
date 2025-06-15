const HeroHeadline = ({ isVisible }) => {
  return (
    <div className="mb-6">
      <h1
        className={`text-4xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight transform transition-all duration-1000 delay-200 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        Your{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600">
          Task List
        </span>{" "}
        becomes a<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600">
          Booked Calendar
        </span>{" "}
        in 30 seconds.
      </h1>

      <p
        className={`text-lg md:text-xl text-gray-600 max-w-2xl mx-auto transform transition-all duration-1000 delay-400 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        Just type your tasks naturally, and our AI instantly prioritizes and
        schedules them perfectly for you.
      </p>
    </div>
  );
};

export default HeroHeadline;
