import posthog from "../posthogClient";

/**
 * Track an event with PostHog
 * @param {string} event - The event name
 * @param {Object} properties - Additional properties to track with the event
 * @param {Object} options - Additional options for the capture
 */
export const trackEvent = (event, properties = {}, options = {}) => {
  if (typeof window === "undefined") return;

  try {
    posthog.capture(
      event,
      {
        ...properties,
        timestamp: new Date().toISOString(),
      },
      options
    );
  } catch (error) {
    console.error("Error tracking event:", error);
  }
};

/**
 * Identify a user with PostHog
 * @param {string} userId - The unique user identifier
 * @param {Object} properties - User properties to set
 */
export const identifyUser = (userId, properties = {}) => {
  if (typeof window === "undefined" || !userId) return;

  try {
    posthog.identify(userId, {
      ...properties,
      identified_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error identifying user:", error);
  }
};

/**
 * Set user properties
 * @param {Object} properties - Properties to set for the current user
 */
export const setUserProperties = (properties = {}) => {
  if (typeof window === "undefined") return;

  try {
    posthog.people.set(properties);
  } catch (error) {
    console.error("Error setting user properties:", error);
  }
};

/**
 * Track a page view
 * @param {string} path - The page path
 * @param {Object} properties - Additional properties for the page view
 */
export const trackPageView = (path, properties = {}) => {
  if (typeof window === "undefined") return;

  try {
    posthog.capture("$pageview", {
      $current_url: window.location.href,
      $pathname: path || window.location.pathname,
      ...properties,
    });
  } catch (error) {
    console.error("Error tracking page view:", error);
  }
};

/**
 * Reset the user session (useful on logout)
 */
export const resetUser = () => {
  if (typeof window === "undefined") return;

  try {
    posthog.reset();
  } catch (error) {
    console.error("Error resetting user:", error);
  }
};

/**
 * Track user signup
 * @param {string} userId - The user ID
 * @param {Object} properties - Additional signup properties
 */
export const trackSignup = (userId, properties = {}) => {
  trackEvent("user_signed_up", {
    user_id: userId,
    signup_method: properties.method || "email",
    ...properties,
  });
};

/**
 * Track user login
 * @param {string} userId - The user ID
 * @param {Object} properties - Additional login properties
 */
export const trackLogin = (userId, properties = {}) => {
  trackEvent("user_logged_in", {
    user_id: userId,
    login_method: properties.method || "email",
    ...properties,
  });
};

/**
 * Track user logout
 */
export const trackLogout = () => {
  trackEvent("user_logged_out");
};

/**
 * Track subscription events
 * @param {string} eventType - The type of subscription event (started, cancelled, renewed, etc.)
 * @param {Object} properties - Subscription properties
 */
export const trackSubscription = (eventType, properties = {}) => {
  trackEvent(`subscription_${eventType}`, {
    plan_type: properties.planType,
    plan_price: properties.planPrice,
    billing_interval: properties.billingInterval,
    ...properties,
  });
};

/**
 * Track task-related events
 * @param {string} action - The task action (created, completed, deleted, etc.)
 * @param {Object} properties - Task properties
 */
export const trackTask = (action, properties = {}) => {
  trackEvent(`task_${action}`, {
    task_id: properties.taskId,
    task_category: properties.category,
    task_priority: properties.priority,
    task_urgency: properties.urgency,
    ...properties,
  });
};

/**
 * Track calendar events
 * @param {string} action - The calendar action (event_created, sync_completed, etc.)
 * @param {Object} properties - Calendar properties
 */
export const trackCalendar = (action, properties = {}) => {
  trackEvent(`calendar_${action}`, {
    calendar_type: properties.calendarType || "google",
    event_count: properties.eventCount,
    ...properties,
  });
};

/**
 * Track AI feature usage
 * @param {string} feature - The AI feature used (prioritize, schedule, etc.)
 * @param {Object} properties - AI feature properties
 */
export const trackAIFeature = (feature, properties = {}) => {
  trackEvent(`ai_${feature}_used`, {
    feature_name: feature,
    user_plan: properties.userPlan,
    tokens_used: properties.tokensUsed,
    ...properties,
  });
};

/**
 * Track navigation events
 * @param {string} from - The page navigated from
 * @param {string} to - The page navigated to
 */
export const trackNavigation = (from, to) => {
  trackEvent("navigation", {
    from_page: from,
    to_page: to,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track errors
 * @param {string} errorType - The type of error
 * @param {string} errorMessage - The error message
 * @param {Object} properties - Additional error properties
 */
export const trackError = (errorType, errorMessage, properties = {}) => {
  trackEvent("error_occurred", {
    error_type: errorType,
    error_message: errorMessage,
    page_url: typeof window !== "undefined" ? window.location.href : "",
    user_agent: typeof window !== "undefined" ? window.navigator.userAgent : "",
    ...properties,
  });
};

/**
 * Track feature usage
 * @param {string} feature - The feature name
 * @param {Object} properties - Feature properties
 */
export const trackFeatureUsage = (feature, properties = {}) => {
  trackEvent("feature_used", {
    feature_name: feature,
    ...properties,
  });
};

/**
 * Track conversion events
 * @param {string} conversionType - The type of conversion
 * @param {Object} properties - Conversion properties
 */
export const trackConversion = (conversionType, properties = {}) => {
  trackEvent(`conversion_${conversionType}`, {
    conversion_type: conversionType,
    conversion_value: properties.value,
    ...properties,
  });
};

/**
 * Get the current distinct ID
 * @returns {string|null} The current distinct ID
 */
export const getDistinctId = () => {
  if (typeof window === "undefined") return null;

  try {
    return posthog.get_distinct_id();
  } catch (error) {
    console.error("Error getting distinct ID:", error);
    return null;
  }
};

/**
 * Check if a feature flag is enabled
 * @param {string} flagKey - The feature flag key
 * @returns {boolean} Whether the flag is enabled
 */
export const isFeatureEnabled = (flagKey) => {
  if (typeof window === "undefined") return false;

  try {
    return posthog.isFeatureEnabled(flagKey);
  } catch (error) {
    console.error("Error checking feature flag:", error);
    return false;
  }
};

/**
 * Get feature flag variant
 * @param {string} flagKey - The feature flag key
 * @returns {string|boolean} The feature flag variant or boolean value
 */
export const getFeatureFlag = (flagKey) => {
  if (typeof window === "undefined") return false;

  try {
    return posthog.getFeatureFlag(flagKey);
  } catch (error) {
    console.error("Error getting feature flag:", error);
    return false;
  }
};

/**
 * Set super properties (properties that will be sent with every event)
 * @param {Object} properties - Properties to set as super properties
 */
export const setSuperProperties = (properties = {}) => {
  if (typeof window === "undefined") return;

  try {
    posthog.register(properties);
  } catch (error) {
    console.error("Error setting super properties:", error);
  }
};

/**
 * Remove super properties
 * @param {Array<string>} propertyNames - Array of property names to remove
 */
export const removeSuperProperties = (propertyNames = []) => {
  if (typeof window === "undefined") return;

  try {
    propertyNames.forEach((prop) => posthog.unregister(prop));
  } catch (error) {
    console.error("Error removing super properties:", error);
  }
};

/**
 * Track button clicks
 * @param {string} buttonName - The button name or identifier
 * @param {Object} properties - Additional properties
 */
export const trackButtonClick = (buttonName, properties = {}) => {
  trackEvent("button_clicked", {
    button_name: buttonName,
    ...properties,
  });
};

/**
 * Track form submissions
 * @param {string} formName - The form name or identifier
 * @param {Object} properties - Additional properties
 */
export const trackFormSubmit = (formName, properties = {}) => {
  trackEvent("form_submitted", {
    form_name: formName,
    ...properties,
  });
};
