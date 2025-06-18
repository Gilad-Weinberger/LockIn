import { SUBSCRIPTION_LEVELS } from "@/lib/utils/subscription-utils";

const SubscriptionBadge = ({ level }) => {
  const badgeConfig = {
    [SUBSCRIPTION_LEVELS.FREE]: (
      <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
        Free
      </span>
    ),
    [SUBSCRIPTION_LEVELS.PRO]: (
      <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
        Professional
      </span>
    ),
    [SUBSCRIPTION_LEVELS.ENTERPRISE]: (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        Enterprise
      </span>
    ),
  };

  return badgeConfig[level] || badgeConfig[SUBSCRIPTION_LEVELS.FREE];
};

export default SubscriptionBadge;
