import { getUserData } from "@/lib/functions/userFunctions";

// Subscription level constants
export const SUBSCRIPTION_LEVELS = {
  FREE: "free",
  PRO: "pro",
};

// Plan variant IDs from environment variables
const PLAN_VARIANTS = {
  PRO_MONTHLY: process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID,
  PRO_YEARLY: process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID,
};

/**
 * Get user's subscription level
 * @param {string} userId - User ID
 * @returns {Promise<string>} Subscription level (free, professional, enterprise)
 */
export const getUserSubscriptionLevel = async (userId) => {
  if (!userId) return SUBSCRIPTION_LEVELS.FREE;

  try {
    const userData = await getUserData(userId);

    // If no payment access, user is on free plan
    if (!userData?.lemonsqueezyHasAccess) {
      return SUBSCRIPTION_LEVELS.FREE;
    }

    const variantId = userData?.lemonsqueezyVariantId;

    // Check if it's a Professional plan (monthly or yearly)
    if (
      variantId === PLAN_VARIANTS.PRO_MONTHLY ||
      variantId === PLAN_VARIANTS.PRO_YEARLY
    ) {
      return SUBSCRIPTION_LEVELS.PRO;
    }

    // Fallback to free if variant ID doesn't match known plans
    return SUBSCRIPTION_LEVELS.FREE;
  } catch (error) {
    console.error("Error getting user subscription level:", error);
    return SUBSCRIPTION_LEVELS.FREE;
  }
};

/**
 * Get user's billing cycle (monthly/yearly)
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} Billing cycle or null for free users
 */
export const getUserBillingCycle = async (userId) => {
  if (!userId) return null;

  try {
    const userData = await getUserData(userId);

    if (!userData?.lemonsqueezyHasAccess) {
      return null;
    }

    const variantId = userData?.lemonsqueezyVariantId;

    // Check yearly plans
    if (
      variantId === PLAN_VARIANTS.PRO_YEARLY ||
      variantId === PLAN_VARIANTS.ENTERPRISE_YEARLY
    ) {
      return "yearly";
    }

    // Check monthly plans
    if (
      variantId === PLAN_VARIANTS.PRO_MONTHLY ||
      variantId === PLAN_VARIANTS.ENTERPRISE_MONTHLY
    ) {
      return "monthly";
    }

    return null;
  } catch (error) {
    console.error("Error getting user billing cycle:", error);
    return null;
  }
};

/**
 * Check if user has specific subscription level or higher
 * @param {string} userId - User ID
 * @param {string} requiredLevel - Required subscription level
 * @returns {Promise<boolean>} True if user meets the requirement
 */
export const hasSubscriptionLevel = async (userId, requiredLevel) => {
  if (!userId) return requiredLevel === SUBSCRIPTION_LEVELS.FREE;

  try {
    const userLevel = await getUserSubscriptionLevel(userId);

    const levelHierarchy = {
      [SUBSCRIPTION_LEVELS.FREE]: 0,
      [SUBSCRIPTION_LEVELS.PRO]: 1,
      [SUBSCRIPTION_LEVELS.ENTERPRISE]: 2,
    };

    return levelHierarchy[userLevel] >= levelHierarchy[requiredLevel];
  } catch (error) {
    console.error("Error checking subscription level:", error);
    return requiredLevel === SUBSCRIPTION_LEVELS.FREE;
  }
};

/**
 * Check if user can access a specific feature
 * @param {string} userId - User ID
 * @param {string} feature - Feature to check
 * @returns {Promise<boolean>} True if user can access the feature
 */
export const canAccessFeature = async (userId, feature) => {
  if (!userId) return false;

  try {
    const level = await getUserSubscriptionLevel(userId);

    const featureAccess = {
      // Free features
      basic_tasks: [
        SUBSCRIPTION_LEVELS.FREE,
        SUBSCRIPTION_LEVELS.PRO,
        SUBSCRIPTION_LEVELS.ENTERPRISE,
      ],
      basic_matrix: [
        SUBSCRIPTION_LEVELS.FREE,
        SUBSCRIPTION_LEVELS.PRO,
        SUBSCRIPTION_LEVELS.ENTERPRISE,
      ],

      // Professional features
      unlimited_tasks: [
        SUBSCRIPTION_LEVELS.PRO,
        SUBSCRIPTION_LEVELS.ENTERPRISE,
      ],
      ai_scheduling: [SUBSCRIPTION_LEVELS.PRO, SUBSCRIPTION_LEVELS.ENTERPRISE],
      calendar_integration: [
        SUBSCRIPTION_LEVELS.FREE,
        SUBSCRIPTION_LEVELS.PRO,
        SUBSCRIPTION_LEVELS.ENTERPRISE,
      ],
      google_calendar: [
        SUBSCRIPTION_LEVELS.PRO,
        SUBSCRIPTION_LEVELS.ENTERPRISE,
      ],
      custom_ai_rules: [
        SUBSCRIPTION_LEVELS.PRO,
        SUBSCRIPTION_LEVELS.ENTERPRISE,
      ],

      // Enterprise features
      advanced_analytics: [SUBSCRIPTION_LEVELS.ENTERPRISE],
      priority_support: [SUBSCRIPTION_LEVELS.ENTERPRISE],
      custom_algorithms: [SUBSCRIPTION_LEVELS.ENTERPRISE],
    };

    return featureAccess[feature]?.includes(level) || false;
  } catch (error) {
    console.error("Error checking feature access:", error);
    return false;
  }
};

/**
 * Check if user is on free plan
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if user is on free plan
 */
export const isOnFreePlan = async (userId) => {
  if (!userId) return true;

  try {
    const level = await getUserSubscriptionLevel(userId);
    return level === SUBSCRIPTION_LEVELS.FREE;
  } catch (error) {
    console.error("Error checking free plan status:", error);
    return true;
  }
};

/**
 * Check if user is on professional plan
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if user is on professional plan
 */
export const isOnProfessionalPlan = async (userId) => {
  if (!userId) return false;

  try {
    const level = await getUserSubscriptionLevel(userId);
    return level === SUBSCRIPTION_LEVELS.PRO;
  } catch (error) {
    console.error("Error checking professional plan status:", error);
    return false;
  }
};

/**
 * Check if user is on enterprise plan
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if user is on enterprise plan
 */
export const isOnEnterprisePlan = async (userId) => {
  if (!userId) return false;

  try {
    const level = await getUserSubscriptionLevel(userId);
    return level === SUBSCRIPTION_LEVELS.ENTERPRISE;
  } catch (error) {
    console.error("Error checking enterprise plan status:", error);
    return false;
  }
};

/**
 * Check if user can manage billing (has a LemonSqueezy customer ID)
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if user can access billing portal
 */
export const canManageBilling = async (userId) => {
  if (!userId) return false;

  try {
    const userData = await getUserData(userId);
    return userData?.lemonsqueezyCustomerId != null;
  } catch (error) {
    console.error("Error checking billing management access:", error);
    return false;
  }
};

/**
 * Check if user has any paid subscription
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if user has paid access
 */
export const hasPaymentAccess = async (userId) => {
  if (!userId) return false;

  try {
    const userData = await getUserData(userId);
    return userData?.lemonsqueezyHasAccess === true;
  } catch (error) {
    console.error("Error checking payment access:", error);
    return false;
  }
};
