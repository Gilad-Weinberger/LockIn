import { SUBSCRIPTION_LEVELS } from "@/lib/utils/subscription-utils";

const PlanFeatures = ({ subscriptionLevel }) => {
  const getPlanFeatures = (level) => {
    const features = {
      [SUBSCRIPTION_LEVELS.FREE]: [
        "Up to 50 tasks",
        "Basic Eisenhower Matrix",
        "Simple scheduling",
        "Basic analytics",
      ],
      [SUBSCRIPTION_LEVELS.PRO]: [
        "Unlimited tasks",
        "AI-powered prioritization",
        "AI-powered scheduling", 
        "Google Calendar integration",
        "Custom AI rules",
        "Advanced analytics",
      ],
      [SUBSCRIPTION_LEVELS.ENTERPRISE]: [
        "Everything in Professional",
        "Custom algorithms",
        "Priority support",
        "Advanced integrations",
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
