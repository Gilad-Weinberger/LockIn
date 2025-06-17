import PricingCheckout from "./PricingCheckout";

const PricingCard = ({ plan, isAnnual }) => {
  return (
    <div
      className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 max-w-md ${
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
              {plan.monthlyPrice === 0 ? "" : isAnnual ? "/year" : "/month"}
            </span>
          </div>

          {isAnnual && plan.monthlyPrice > 0 && (
            <div className="text-xs sm:text-sm text-gray-500">
              {Math.round(
                (plan.monthlyPrice * 12 - plan.annualPrice) / plan.monthlyPrice
              )}{" "}
              months free when billed annually
            </div>
          )}
        </div>

        {/* CTA Button */}
        <PricingCheckout plan={plan} isAnnual={isAnnual} />

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
  );
};

export default PricingCard;
