/**
 * Google Calendar Sync Utilities
 * Centralized configuration and helper functions for Google Calendar integration
 */

// Sync configuration
export const SYNC_CONFIG = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  BATCH_SIZE: 5,
  BATCH_DELAY_MS: 1000,
  AUTO_SYNC_COOLDOWN_MS: 5 * 60 * 1000, // 5 minutes
  DEFAULT_EVENT_DURATION_HOURS: 1,
};

// Event types that should be synced
export const SYNCABLE_TASK_TYPES = ["event"];

// Task statuses that should trigger sync
export const SYNC_TRIGGERS = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
};

/**
 * Check if a task should be synced to Google Calendar
 * @param {Object} task - Task object
 * @returns {boolean} Whether the task should be synced
 */
export const shouldSyncTask = (task) => {
  if (!task) return false;

  // Only sync events (not deadlines)
  if (!SYNCABLE_TASK_TYPES.includes(task.type)) return false;

  // Must have scheduling information
  if (!task.startDate || !task.endDate) return false;

  // Don't sync completed tasks unless they were previously synced
  if (task.isDone && !task.googleCalendarEventId) return false;

  // Must be in the future (end date hasn't passed)
  const now = new Date();
  const taskEndDate = task.endDate.toDate
    ? task.endDate.toDate()
    : new Date(task.endDate);

  return taskEndDate > now;
};

/**
 * Check if a task needs to be synced (comparing current vs previous state)
 * @param {Object} currentTask - Current task state
 * @param {Object} previousTask - Previous task state (optional)
 * @returns {boolean} Whether sync is needed
 */
export const needsSync = (currentTask, previousTask = null) => {
  if (!shouldSyncTask(currentTask)) return false;

  // New task that should be synced
  if (!previousTask && !currentTask.googleCalendarEventId) return true;

  // Task was updated and has fields that affect Google Calendar
  if (previousTask && currentTask.googleCalendarEventId) {
    const syncableFields = ["title", "startDate", "endDate", "isDone"];
    return syncableFields.some((field) => {
      const current = currentTask[field];
      const previous = previousTask[field];

      // Handle Date objects and timestamps
      if (current instanceof Date || previous instanceof Date) {
        const currentTime =
          current instanceof Date
            ? current.getTime()
            : new Date(current).getTime();
        const previousTime =
          previous instanceof Date
            ? previous.getTime()
            : new Date(previous).getTime();
        return currentTime !== previousTime;
      }

      return current !== previous;
    });
  }

  return false;
};

/**
 * Format task data for Google Calendar event
 * @param {Object} task - Task object
 * @returns {Object} Google Calendar event data
 */
export const formatTaskForGoogleCalendar = (task) => {
  const startTime =
    task.startDate instanceof Date ? task.startDate : new Date(task.startDate);

  const endTime =
    task.endDate instanceof Date ? task.endDate : new Date(task.endDate);

  return {
    title: task.title,
    description: `Task: ${task.title}${
      task.scheduling_reasoning
        ? `\n\nScheduling: ${task.scheduling_reasoning}`
        : ""
    }`,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};

/**
 * Create end date for event tasks (default 1 hour duration)
 * @param {Date|string} startDate - Start date
 * @param {number} durationHours - Duration in hours (default: 1)
 * @returns {Date} End date
 */
export const createEndDateForEvent = (
  startDate,
  durationHours = SYNC_CONFIG.DEFAULT_EVENT_DURATION_HOURS
) => {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = new Date(start);
  end.setHours(end.getHours() + durationHours);
  return end;
};

/**
 * Check if sync operation should be retried based on error
 * @param {Error} error - Error object
 * @returns {boolean} Whether to retry
 */
export const shouldRetrySync = (error) => {
  if (!error) return false;

  // Retry on network errors, rate limits, or temporary server errors
  const retryableErrors = [
    "ENOTFOUND",
    "ECONNRESET",
    "ECONNREFUSED",
    "ETIMEDOUT",
    "Rate limit exceeded",
    "quotaExceeded",
    "rateLimitExceeded",
    "HTTP 429",
    "HTTP 502",
    "HTTP 503",
    "HTTP 504",
  ];

  const errorMessage = error.message || error.toString();
  return retryableErrors.some((pattern) =>
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
};

/**
 * Get delay for retry attempt (exponential backoff)
 * @param {number} attempt - Attempt number (1-based)
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {number} Delay in milliseconds
 */
export const getRetryDelay = (
  attempt,
  baseDelay = SYNC_CONFIG.RETRY_DELAY_MS
) => {
  return baseDelay * Math.pow(2, attempt - 1);
};

/**
 * Log sync operation for debugging
 * @param {string} operation - Operation type
 * @param {string} taskId - Task ID
 * @param {string} status - Status ('start', 'success', 'error')
 * @param {Object} details - Additional details
 */
export const logSyncOperation = (operation, taskId, status, details = {}) => {
  const timestamp = new Date().toISOString();
  const logPrefix = `[Google Calendar Sync] ${timestamp}`;

  switch (status) {
    case "start":
      console.log(`${logPrefix} Starting ${operation} for task ${taskId}`);
      break;
    case "success":
      console.log(
        `${logPrefix} ✅ ${operation} successful for task ${taskId}`,
        details
      );
      break;
    case "error":
      console.error(
        `${logPrefix} ❌ ${operation} failed for task ${taskId}`,
        details
      );
      break;
    default:
      console.log(
        `${logPrefix} ${operation} - ${status} for task ${taskId}`,
        details
      );
  }
};

export default {
  SYNC_CONFIG,
  SYNCABLE_TASK_TYPES,
  SYNC_TRIGGERS,
  shouldSyncTask,
  needsSync,
  formatTaskForGoogleCalendar,
  createEndDateForEvent,
  shouldRetrySync,
  getRetryDelay,
  logSyncOperation,
};
