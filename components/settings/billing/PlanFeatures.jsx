import { SUBSCRIPTION_LEVELS } from "@/lib/utils/subscription-utils";

const PlanFeatures = ({ subscriptionLevel }) => {
  const getPlanFeatures = (level) => {
    const features = {
      [SUBSCRIPTION_LEVELS.FREE]: [
        "Basic task management",
        "Simple Eisenhower Matrix",
        "Limited AI prioritization",
      ],
      [SUBSCRIPTION_LEVELS.PROFESSIONAL]: [
        "Unlimited tasks",
        "Advanced AI scheduling",
        "Calendar integration",
        "Custom AI rules",
        "Priority support",
      ],
      [SUBSCRIPTION_LEVELS.ENTERPRISE]: [
        "Everything in Professional",
        "Advanced analytics",
        "Custom algorithms",
        "Dedicated support",
        "Team collaboration",
      ],
    };
    return features[level] || features[SUBSCRIPTION_LEVELS.FREE];
  };

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-900 mb-2">Plan Features:</h4>
      <ul className="space-y-1">
        {getPlanFeatures(subscriptionLevel).map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-600">
            <svg
              className="w-4 h-4 text-green-500 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlanFeatures;
