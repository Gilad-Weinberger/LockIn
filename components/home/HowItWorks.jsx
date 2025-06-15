import { howItWorksSteps } from "@/lib/homepage-data";

const HowItWorks = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            From Task List to Schedule in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600">
              3 Simple Steps
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI does the heavy lifting so you can focus on what matters most.
            No more manual planning or overwhelming to-do lists.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 to-purple-200 transform -translate-y-1/2"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {howItWorksSteps.map((step, index) => (
              <div key={step.step} className="relative">
                {/* Step Card */}
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 h-full flex flex-col">
                  {/* Step Number and Icon */}
                  <div className="flex items-center gap-3 mb-6">
                    {/* Step Number */}
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} text-white text-xl font-bold shadow-lg`}
                    >
                      {step.step}
                    </div>

                    {/* Icon */}
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${step.bgColor} ${step.textColor}`}
                    >
                      {step.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Examples */}
                  <div className={`${step.bgColor} rounded-lg p-4`}>
                    <p className={`text-sm font-medium ${step.textColor} mb-2`}>
                      Examples:
                    </p>
                    <ul className="space-y-1">
                      {step.examples.map((example, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-700 flex items-center"
                        >
                          <span
                            className={`w-1.5 h-1.5 ${
                              step.color.includes("blue")
                                ? "bg-blue-400"
                                : step.color.includes("green")
                                ? "bg-green-400"
                                : "bg-purple-400"
                            } rounded-full mr-2`}
                          ></span>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Arrow for mobile */}
                {index < howItWorksSteps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-8">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Powered Badge */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-blue-700 font-semibold">
              Powered by Advanced AI - No Manual Work Required
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
