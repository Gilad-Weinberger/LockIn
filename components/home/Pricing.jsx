"use client";

import { useState } from "react";
import Link from "next/link";
import { pricingPlans } from "@/lib/homepage-data";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600">
              Perfect Plan
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-4 sm:px-0">
            Start with our free tier and upgrade as your productivity needs
            grow. All plans include our core AI scheduling technology.
          </p>

          {/* Billing Toggle */}
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
              Save up to 30%
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                plan.isPopular ? "transform md:scale-105 z-10" : ""
              } ${plan.color}`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 sm:px-6 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-6 sm:p-8">
                {/* Plan Header */}
                <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-3 sm:mb-4">
                    <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                      ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-sm sm:text-base text-gray-600">
                      {plan.monthlyPrice === 0
                        ? ""
                        : isAnnual
                        ? "/year"
                        : "/month"}
                    </span>
                  </div>

                  {isAnnual && plan.monthlyPrice > 0 && (
                    <div className="text-xs sm:text-sm text-gray-500">
                      {Math.round(
                        (plan.monthlyPrice * 12 - plan.annualPrice) /
                          plan.monthlyPrice
                      )}{" "}
                      months free when billed annually
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <Link
                  href="/auth/signup"
                  className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-200 mb-6 sm:mb-8 text-sm sm:text-base text-center inline-block ${plan.buttonColor}`}
                >
                  {plan.name === "Starter" ? "Get Started Free" : "Get Started"}
                </Link>

                {/* Features */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="font-semibold text-gray-900 text-xs sm:text-sm uppercase tracking-wide">
                    What's included:
                  </h4>
                  <ul className="space-y-2 sm:space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start text-sm sm:text-base text-gray-700"
                      >
                        <svg
                          className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 mt-0.5 flex-shrink-0 ${plan.textColor}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.limitations.length > 0 && (
                    <ul className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t border-gray-100">
                      {plan.limitations.map((limitation, limitIndex) => (
                        <li
                          key={limitIndex}
                          className="flex items-start text-sm sm:text-base text-gray-500"
                        >
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 mt-0.5 flex-shrink-0 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          <span>{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
