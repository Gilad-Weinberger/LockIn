import { SUBSCRIPTION_LEVELS } from "@/lib/utils/subscription-utils";

const SubscriptionBadge = ({ level }) => {
  const badges = {
    [SUBSCRIPTION_LEVELS.FREE]: (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Free
      </span>
    ),
    [SUBSCRIPTION_LEVELS.PROFESSIONAL]: (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Professional
      </span>
    ),
    [SUBSCRIPTION_LEVELS.ENTERPRISE]: (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        Enterprise
      </span>
    ),
  };

  return badges[level] || badges[SUBSCRIPTION_LEVELS.FREE];
};

export default SubscriptionBadge;
