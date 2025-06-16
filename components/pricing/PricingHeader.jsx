"use client";

import { useState } from "react";

const PricingHeader = ({
  title,
  subtitle,
  showToggle = true,
  isAnnual,
  setIsAnnual,
  titleTag = "h1",
}) => {
  const TitleComponent = titleTag;

  return (
    <div className="text-center mb-12 sm:mb-16">
      <TitleComponent
        className={`font-bold text-gray-900 mb-4 ${
          titleTag === "h1"
            ? "text-3xl sm:text-4xl md:text-5xl"
            : "text-2xl sm:text-3xl md:text-4xl"
        }`}
      >
        {title || (
          <>
            Choose Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600">
              Perfect Plan
            </span>
          </>
        )}
      </TitleComponent>
      <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-4 sm:px-0">
        {subtitle ||
          "Start with our free tier and upgrade as your productivity needs grow. All plans include our core AI scheduling technology."}
      </p>

      {showToggle && (
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <span
            className={`font-medium text-sm sm:text-base ${
              !isAnnual ? "text-gray-900" : "text-gray-500"
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
              isAnnual ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                isAnnual ? "translate-x-5 sm:translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span
            className={`font-medium text-sm sm:text-base ${
              isAnnual ? "text-gray-900" : "text-gray-500"
            }`}
          >
            Annual
          </span>
          <span className="ml-0 sm:ml-2 mt-2 sm:mt-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Save up to 20%
          </span>
        </div>
      )}
    </div>
  );
};

export default PricingHeader;
