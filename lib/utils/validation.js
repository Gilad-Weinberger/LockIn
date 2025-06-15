/**
 * Validation utilities for API routes
 */

/**
 * Validate request body for prioritization
 * @param {Object} body - Request body
 * @returns {Object} Validation result
 */
export const validatePrioritizeRequest = (body) => {
  const errors = [];
  
  if (!body) {
    errors.push("Request body is required");
    return { isValid: false, errors };
  }

  const { tasks, userId } = body;

  if (!tasks) {
    errors.push("Tasks array is required");
  } else if (!Array.isArray(tasks)) {
    errors.push("Tasks must be an array");
  } else if (tasks.length === 0) {
    errors.push("Tasks array cannot be empty");
  }

  if (!userId) {
    errors.push("User ID is required");
  } else if (typeof userId !== "string") {
    errors.push("User ID must be a string");
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: { tasks, userId }
  };
};

/**
 * Validate request body for scheduling
 * @param {Object} body - Request body
 * @returns {Object} Validation result
 */
export const validateScheduleRequest = (body) => {
  const errors = [];
  
  if (!body) {
    errors.push("Request body is required");
    return { isValid: false, errors };
  }

  const { userId, forceReschedule } = body;

  if (!userId) {
    errors.push("User ID is required");
  } else if (typeof userId !== "string") {
    errors.push("User ID must be a string");
  }

  if (forceReschedule !== undefined && typeof forceReschedule !== "boolean") {
    errors.push("forceReschedule must be a boolean");
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: { userId, forceReschedule: forceReschedule || false }
  };
};

/**
 * Validate environment variables
 * @returns {Object} Validation result
 */
export const validateEnvironment = () => {
  const errors = [];
  
  if (!process.env.GEMINI_API_KEY) {
    errors.push("GEMINI_API_KEY environment variable is required");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize user ID for logging
 * @param {string} userId - User ID
 * @returns {string} Sanitized user ID
 */
export const sanitizeUserId = (userId) => {
  if (!userId || typeof userId !== "string") {
    return "invalid-user-id";
  }
  
  if (userId.length <= 8) {
    return userId;
  }
  
  return userId.substring(0, 8) + "...";
}; 