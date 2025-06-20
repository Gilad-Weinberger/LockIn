/**
 * Utility functions for interacting with database API endpoints
 */

// =================================
// USER API FUNCTIONS
// =================================

/**
 * Get user data by ID
 * @param {string} userId - User ID to fetch
 * @returns {Promise<Object>} User data
 */
export const getUserById = async (userId) => {
  const response = await fetch(`/api/db/users?userId=${userId}`);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to fetch user");
  }

  return result.data;
};

/**
 * Create a new user
 * @param {Object} userData - User data to create
 * @returns {Promise<Object>} Created user data
 */
export const createUserApi = async (userData) => {
  const response = await fetch("/api/db/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to create user");
  }

  return result.data;
};

/**
 * Update user data
 * @param {string} userId - User ID to update
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user data
 */
export const updateUserApi = async (userId, userData) => {
  const response = await fetch(`/api/db/users?userId=${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to update user");
  }

  return result.data;
};

/**
 * Delete a user
 * @param {string} userId - User ID to delete
 * @returns {Promise<Object>} Success message
 */
export const deleteUserApi = async (userId) => {
  const response = await fetch(`/api/db/users?userId=${userId}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to delete user");
  }

  return result;
};

// =================================
// TASK API FUNCTIONS
// =================================

/**
 * Get task by ID
 * @param {string} taskId - Task ID to fetch
 * @returns {Promise<Object>} Task data
 */
export const getTaskById = async (taskId) => {
  const response = await fetch(`/api/db/tasks?taskId=${taskId}`);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to fetch task");
  }

  return result.data;
};

/**
 * Get all tasks for a user with optional filters
 * @param {string} userId - User ID
 * @param {Object} filters - Optional filters
 * @param {string} filters.category - Filter by category
 * @param {boolean} filters.isDone - Filter by completion status
 * @param {string} filters.priority - Filter by priority level
 * @param {string} filters.taskDate - Filter by task date
 * @returns {Promise<Array>} Array of tasks
 */
export const getUserTasks = async (userId, filters = {}) => {
  let url = `/api/db/tasks?userId=${userId}`;

  // Add optional filters
  if (filters.category)
    url += `&category=${encodeURIComponent(filters.category)}`;
  if (filters.isDone !== undefined) url += `&isDone=${filters.isDone}`;
  if (filters.priority)
    url += `&priority=${encodeURIComponent(filters.priority)}`;
  if (filters.taskDate)
    url += `&taskDate=${encodeURIComponent(filters.taskDate)}`;

  const response = await fetch(url);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to fetch tasks");
  }

  return result.data;
};

/**
 * Create a new task
 * @param {Object} taskData - Task data to create
 * @returns {Promise<Object>} Created task data
 */
export const createTaskApi = async (taskData) => {
  const response = await fetch("/api/db/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to create task");
  }

  return result.data;
};

/**
 * Update task data
 * @param {string} taskId - Task ID to update
 * @param {Object} taskData - Updated task data
 * @returns {Promise<Object>} Updated task data
 */
export const updateTaskApi = async (taskId, taskData) => {
  const response = await fetch(`/api/db/tasks?taskId=${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to update task");
  }

  return result.data;
};

/**
 * Delete a task
 * @param {string} taskId - Task ID to delete
 * @returns {Promise<Object>} Success message
 */
export const deleteTaskApi = async (taskId) => {
  const response = await fetch(`/api/db/tasks?taskId=${taskId}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to delete task");
  }

  return result;
};

// =================================
// FEEDBACK API FUNCTIONS
// =================================

/**
 * Get feedback by ID
 * @param {string} feedbackId - Feedback ID to fetch
 * @returns {Promise<Object>} Feedback data
 */
export const getFeedbackById = async (feedbackId) => {
  const response = await fetch(`/api/db/feedback?feedbackId=${feedbackId}`);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to fetch feedback");
  }

  return result.data;
};

/**
 * Get all feedback with optional filters
 * @param {Object} filters - Optional filters
 * @param {string} filters.userId - Filter by user ID
 * @param {boolean} filters.handled - Filter by handled status
 * @returns {Promise<Array>} Array of feedback items
 */
export const getAllFeedback = async (filters = {}) => {
  let url = "/api/db/feedback";
  const params = [];

  if (filters.userId) params.push(`userId=${filters.userId}`);
  if (filters.handled !== undefined) params.push(`handled=${filters.handled}`);

  if (params.length > 0) {
    url += "?" + params.join("&");
  }

  const response = await fetch(url);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to fetch feedback");
  }

  return result.data;
};

/**
 * Create a new feedback item
 * @param {Object} feedbackData - Feedback data to create
 * @returns {Promise<Object>} Created feedback data
 */
export const createFeedbackApi = async (feedbackData) => {
  const response = await fetch("/api/db/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(feedbackData),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to create feedback");
  }

  return result.data;
};

/**
 * Update feedback data
 * @param {string} feedbackId - Feedback ID to update
 * @param {Object} feedbackData - Updated feedback data
 * @returns {Promise<Object>} Updated feedback data
 */
export const updateFeedbackApi = async (feedbackId, feedbackData) => {
  const response = await fetch(`/api/db/feedback?feedbackId=${feedbackId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(feedbackData),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to update feedback");
  }

  return result.data;
};

/**
 * Delete a feedback item
 * @param {string} feedbackId - Feedback ID to delete
 * @returns {Promise<Object>} Success message
 */
export const deleteFeedbackApi = async (feedbackId) => {
  const response = await fetch(`/api/db/feedback?feedbackId=${feedbackId}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to delete feedback");
  }

  return result;
};
