"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const StepBar = () => {
  const pathname = usePathname();

  const steps = [
    { name: "Tasks", path: "/tasks", step: 1 },
    { name: "Matrix", path: "/matrix", step: 2 },
    { name: "Calendar", path: "/calendar", step: 3 },
  ];

  const getCurrentStep = () => {
    const currentStep = steps.find((step) => step.path === pathname);
    return currentStep ? currentStep.step : 1;
  };

  const currentStepNumber = getCurrentStep();

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 px-4 py-4 shadow-lg">
      <div className="flex items-center justify-center max-w-md mx-auto">
        {steps.map((step, index) => (
          <div key={step.path} className="flex items-center group">
            {/* Step Circle */}
            <Link
              href={step.path}
              className={`
                relative flex items-center justify-center w-10 h-10 rounded-full 
                border-2 transition-all duration-300 ease-in-out
                transform hover:scale-110 hover:shadow-lg
                ${
                  step.step < currentStepNumber
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 shadow-md"
                    : step.step === currentStepNumber
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 shadow-lg shadow-blue-200"
                    : "bg-white border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                }
              `}
            >
              {step.step < currentStepNumber ? (
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <span
                  className={`text-sm font-bold ${
                    step.step === currentStepNumber
                      ? "text-white"
                      : "text-gray-500 group-hover:text-blue-600"
                  }`}
                >
                  {step.step}
                </span>
              )}

              {/* Glow effect for current step */}
              {step.step === currentStepNumber && (
                <div className="absolute inset-0 rounded-full bg-blue-400 opacity-15 animate-ping"></div>
              )}
            </Link>

            {/* Step Label */}
            <Link
              href={step.path}
              className={`
                ml-3 text-sm font-semibold transition-all duration-300 ease-in-out
                hover:text-blue-600
                ${
                  step.step <= currentStepNumber
                    ? "text-gray-800"
                    : "text-gray-400 group-hover:text-gray-600"
                }
              `}
            >
              {step.name}
              {step.step === currentStepNumber && (
                <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 to-blue-600 mt-1 rounded-full"></div>
              )}
            </Link>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4 relative">
                <div className="h-0.5 bg-gray-200 rounded-full"></div>
                <div
                  className={`
                    absolute top-0 left-0 h-0.5 rounded-full transition-all duration-500 ease-in-out
                    ${
                      step.step < currentStepNumber
                        ? "w-full bg-gradient-to-r from-blue-500 to-blue-600"
                        : "w-0 bg-gradient-to-r from-blue-500 to-blue-600"
                    }
                  `}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepBar;
