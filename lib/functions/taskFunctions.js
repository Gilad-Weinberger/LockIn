import {
  getTaskById,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
  getUserTasks as fetchUserTasks,
} from "@/lib/functions/dbApi";
import connectToDatabase from "@/lib/mongodb";
import Task from "@/lib/models/Task";

// ================================
// CONSTANTS
// ================================

export const CATEGORY_COLORS = [
  "border-blue-400",
  "border-pink-400",
  "border-green-400",
  "border-yellow-400",
  "border-purple-400",
  "border-red-400",
  "border-indigo-400",
  "border-teal-400",
  "border-orange-400",
  "border-cyan-400",
  "border-lime-400",
  "border-amber-400",
  "border-fuchsia-400",
  "border-emerald-400",
  "border-sky-400",
];

export const UNCATEGORIZED_COLOR = "border-gray-300";

export const QUADRANT_TYPES = {
  DO: "do",
  PLAN: "plan",
  DELEGATE: "delegate",
  DELETE: "delete",
};

export const QUADRANT_CONFIGS = [
  {
    title: "PLAN",
    description: "Important & Not Urgent",
    bgColor: "bg-yellow-50/80",
    borderColor: "border-yellow-300",
    accentColor: "border-yellow-500",
    emptyMessage: "No tasks to plan",
    quadrantType: "plan",
  },
  {
    title: "DO",
    description: "Important & Urgent",
    bgColor: "bg-red-50/80",
    borderColor: "border-red-300",
    accentColor: "border-red-500",
    emptyMessage: "No urgent tasks",
    quadrantType: "do",
  },
  {
    title: "DELETE",
    description: "Not Important & Not Urgent",
    bgColor: "bg-gray-50/80",
    borderColor: "border-gray-300",
    accentColor: "border-gray-500",
    emptyMessage: "No tasks to delete",
    quadrantType: "delete",
  },
  {
    title: "DELEGATE",
    description: "Not Important & Urgent",
    bgColor: "bg-blue-50/80",
    borderColor: "border-blue-300",
    accentColor: "border-blue-500",
    emptyMessage: "No tasks to delegate",
    quadrantType: "delegate",
  },
];

// ================================
// HELPER FUNCTIONS (DRY Elimination)
// ================================

/**
 * Generic error handler for async operations (exported for reuse)
 * @param {Function} operation - Async operation to execute
 * @param {string} errorMessage - Error message to throw on failure
 * @returns {Promise} Promise that resolves with operation result or throws error
 */
export const handleAsyncOperation = async (operation, errorMessage) => {
  try {
    return await operation();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    throw new Error(errorMessage);
  }
};

/**
 * Update a task document with automatic timestamp
 * @param {string} taskId - Task ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise} Promise that resolves when task is updated
 */
const updateTaskDoc = async (taskId, updates) => {
  return updateTaskApi(taskId, {
    ...updates,
    updatedAt: new Date(),
  });
};

/**
 * Filter tasks by criteria
 * @param {Array} tasks - Tasks to filter
 * @param {Function} filterFn - Filter function
 * @returns {Array} Filtered tasks
 */
const filterTasks = (tasks, filterFn) => {
  return tasks.filter(filterFn);
};

/**
 * Generate localStorage key for user data
 * @param {string} userId - User ID
 * @param {string} keyType - Type of key (e.g., 'lastPrioritizedTasks')
 * @returns {string} Generated localStorage key
 */
const getStorageKey = (userId, keyType) => {
  return `${keyType}_${userId}`;
};

/**
 * Check if task has delegate keywords
 * @param {Object} task - Task object
 * @returns {boolean} True if task has delegate keywords
 */
const hasDelegateKeywords = (task) => {
  const title = task.title.toLowerCase();
  return (
    title.includes("meeting") ||
    title.includes("email") ||
    title.includes("call")
  );
};

/**
 * Get userId from a task document
 * @param {string} taskId - Task ID
 * @returns {Promise<string|null>} User ID or null if not found
 */
const getTaskUserId = async (taskId) => {
  try {
    const task = await getTaskById(taskId);
    return task ? task.userId : null;
  } catch (error) {
    console.error("Error getting task for userId:", error);
    return null;
  }
};

/**
 * Clear prioritization cache for user (triggers re-prioritization)
 * @param {string} userId - User ID
 */
const clearPrioritizationCache = (userId) => {
  if (userId && typeof window !== "undefined" && localStorage) {
    localStorage.removeItem(getStorageKey(userId, "lastPrioritizedTasks"));
  }
};

// ================================
// TASK CRUD OPERATIONS
// ================================

/**
 * Create a new task and trigger re-prioritization
 * @param {Object} taskData - Task data object
 * @param {string} taskData.title - Task title
 * @param {string} taskData.taskDate - Task timestamp (date and time)
 * @param {string} taskData.category - Task category
 * @param {string} taskData.type - Task type (deadline or event)
 * @param {boolean} taskData.isDone - Task completion status
 * @param {string} userId - User ID
 * @returns {Promise} Promise that resolves when task is created
 */
export const createTask = async (taskData, userId) => {
  const result = await handleAsyncOperation(async () => {
    const newTaskData = {
      ...taskData,
      priority: null,
      inGroupRank: null,
      startDate: null,
      endDate: null,
      aiScheduleLocked: false,
      googleCalendarSynced: false,
      googleCalendarEventId: null,
      syncedToGoogleCalendar: false,
      lastSyncedAt: null,
      userId,
    };

    const newTask = await createTaskApi(newTaskData);

    // Clear prioritization cache to trigger re-prioritization
    clearPrioritizationCache(userId);

    return newTask;
  }, "Failed to create task");

  return result;
};

/**
 * Update an existing task
 * @param {string} taskId - Task ID
 * @param {Object} updates - Task updates
 * @returns {Promise} Promise that resolves when task is updated
 */
export const updateTask = async (taskId, updates) => {
  return handleAsyncOperation(async () => {
    const userId = await getTaskUserId(taskId);
    const updatedTask = await updateTaskDoc(taskId, updates);
    clearPrioritizationCache(userId);
    return updatedTask;
  }, "Failed to update task");
};

/**
 * Delete a task
 * @param {string} taskId - Task ID
 * @returns {Promise} Promise that resolves when task is deleted
 */
export const deleteTask = async (taskId) => {
  return handleAsyncOperation(async () => {
    const userId = await getTaskUserId(taskId);
    await deleteTaskApi(taskId);
    clearPrioritizationCache(userId);
    return { success: true, message: "Task deleted successfully" };
  }, "Failed to delete task");
};

/**
 * Toggle task done status
 * @param {string} taskId - Task ID
 * @param {boolean} currentStatus - Current done status
 * @returns {Promise} Promise that resolves when task status is toggled
 */
export const toggleTaskDone = async (taskId, currentStatus) => {
  return handleAsyncOperation(async () => {
    const userId = await getTaskUserId(taskId);
    const updatedTask = await updateTaskDoc(taskId, {
      isDone: !currentStatus,
    });
    clearPrioritizationCache(userId);
    return updatedTask;
  }, "Failed to toggle task status");
};

/**
 * Update task priority and group rank
 * @param {string} taskId - Task ID
 * @param {string} priority - Priority level ('urgent-important', etc.)
 * @param {number} inGroupRank - Rank within priority group
 * @returns {Promise} Promise that resolves when task priority is updated
 */
export const updateTaskPriority = async (taskId, priority, inGroupRank) => {
  return handleAsyncOperation(async () => {
    const userId = await getTaskUserId(taskId);
    const updatedTask = await updateTaskDoc(taskId, {
      priority,
      inGroupRank,
    });
    clearPrioritizationCache(userId);
    return updatedTask;
  }, "Failed to update task priority");
};

// ================================
// TASK PRIORITIZATION FUNCTIONS
// ================================

/**
 * Generic batch update helper for documents
 * @param {Array} updates - Array of {taskId, updates} objects
 * @param {string} errorMessage - Error message for failed operations
 * @returns {Promise} Promise that resolves when batch is committed
 */
export const batchUpdateDocuments = async (
  updates,
  errorMessage = "Failed to batch update documents"
) => {
  if (updates.length === 0) return;

  return handleAsyncOperation(async () => {
    await connectToDatabase();

    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.docId || update.taskId },
        update: {
          ...update.updates,
          updatedAt: new Date(),
        },
      },
    }));

    return Task.bulkWrite(bulkOps);
  }, errorMessage);
};

/**
 * Update multiple tasks using bulk write for maximum performance
 * @param {Array} taskUpdates - Array of {taskId, updates} objects
 * @returns {Promise} Promise that resolves when all tasks are updated
 */
const updateMultipleTasks = async (taskUpdates) => {
  const batchUpdates = taskUpdates.map(({ taskId, updates }) => ({
    taskId,
    updates,
  }));

  return batchUpdateDocuments(batchUpdates, "Failed to update multiple tasks");
};

/**
 * Reorder tasks within the same quadrant using optimized batch operations
 * @param {string} movingTaskId - ID of task being moved
 * @param {number} newPosition - New position in the quadrant
 * @param {Array} currentTasks - Current tasks in the quadrant
 * @param {string} quadrantType - Type of quadrant (do, plan, delegate, delete)
 * @returns {Promise} Promise that resolves when reordering is complete
 */
export const reorderTasksInQuadrant = async (
  movingTaskId,
  newPosition,
  currentTasks,
  quadrantType
) => {
  const currentTask = currentTasks.find((task) => task.id === movingTaskId);

  if (!currentTask) return;

  const currentPosition = currentTask.inGroupRank || currentTasks.length;

  // If not actually changing position, don't do anything
  if (currentPosition === newPosition) return;

  return handleAsyncOperation(async () => {
    await connectToDatabase();

    const bulkOps = [];

    // Update the moving task first
    bulkOps.push({
      updateOne: {
        filter: { _id: movingTaskId },
        update: {
          inGroupRank: newPosition,
          updatedAt: new Date(),
        },
      },
    });

    // Prepare batch updates for other tasks in a single pass
    if (newPosition < currentPosition) {
      // Moving up - shift tasks down
      currentTasks.forEach((task) => {
        if (
          task.id !== movingTaskId &&
          task.inGroupRank >= newPosition &&
          task.inGroupRank < currentPosition
        ) {
          bulkOps.push({
            updateOne: {
              filter: { _id: task.id },
              update: {
                inGroupRank: task.inGroupRank + 1,
                updatedAt: new Date(),
              },
            },
          });
        }
      });
    } else {
      // Moving down - shift tasks up
      currentTasks.forEach((task) => {
        if (
          task.id !== movingTaskId &&
          task.inGroupRank > currentPosition &&
          task.inGroupRank <= newPosition
        ) {
          bulkOps.push({
            updateOne: {
              filter: { _id: task.id },
              update: {
                inGroupRank: task.inGroupRank - 1,
                updatedAt: new Date(),
              },
            },
          });
        }
      });
    }

    // Execute all updates in a single bulk operation
    return Task.bulkWrite(bulkOps);
  }, "Failed to reorder tasks");
};

// ================================
// TASK FILTERING AND ORGANIZATION
// ================================

/**
 * Sort tasks by inGroupRank priority (optimized version)
 * @param {Array} tasks - Tasks to sort
 * @returns {Array} Sorted tasks
 */
const sortByInGroupRank = (tasks) => {
  return tasks.sort((a, b) => {
    const aInGroupRank = a.inGroupRank || 999; // Put unprioritized tasks at the end
    const bInGroupRank = b.inGroupRank || 999;
    return aInGroupRank - bInGroupRank; // Lower numbers (higher priority) come first
  });
};

/**
 * Get tasks by quadrant type (optimized version)
 * @param {Array} tasks - All tasks
 * @param {Object} prioritizedTasks - API prioritized tasks response
 * @param {string} quadrantType - Quadrant type (do, plan, delegate, delete)
 * @returns {Array} Tasks for the specified quadrant
 */
export const getTasksByQuadrant = (tasks, prioritizedTasks, quadrantType) => {
  // First, try to use tasks with stored priorities (most common case)
  const tasksWithPriority = tasks.filter(
    (task) => task.priority === quadrantType
  );

  if (tasksWithPriority.length > 0) {
    // Use stored priorities - fast path
    return quadrantType === "do" || quadrantType === "plan"
      ? sortByInGroupRank(tasksWithPriority)
      : tasksWithPriority;
  }

  // If no stored priorities but we have API response, use API response
  if (prioritizedTasks && prioritizedTasks[quadrantType]) {
    const taskIds = prioritizedTasks[quadrantType];
    const quadrantTasks = [];

    // Create a map for O(1) lookup instead of O(n) find operations
    const taskMap = new Map(tasks.map((task) => [task.id, task]));

    for (const id of taskIds) {
      const task = taskMap.get(id);
      if (task) quadrantTasks.push(task);
    }

    return quadrantTasks;
  }

  // Fallback: distribute tasks based on due dates and simple heuristics
  if (!prioritizedTasks) {
    return getFallbackTasks(tasks, quadrantType);
  }

  return [];
};

/**
 * Get fallback tasks when no prioritization is available
 * @param {Array} allTasks - All user tasks
 * @param {string} quadrantType - Quadrant type
 * @returns {Array} Fallback tasks for quadrant
 */
export const getFallbackTasks = (allTasks, quadrantType) => {
  const today = new Date();
  const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

  switch (quadrantType) {
    case "do":
      return allTasks.filter((task) => {
        const taskDate = new Date(task.taskDate);
        return taskDate <= threeDaysFromNow;
      });
    case "plan":
      return allTasks.filter((task) => {
        const taskDate = new Date(task.taskDate);
        return taskDate > threeDaysFromNow;
      });
    case "delegate":
      return allTasks.filter((task) => hasDelegateKeywords(task));
    case "delete":
      return allTasks.filter((task) => task.isDone);
    default:
      return [];
  }
};

/**
 * Filter out tasks that are marked for deletion
 * @param {Array} taskList - List of tasks
 * @returns {Array} Tasks excluding those marked for deletion
 */
export const getTasksExcludingDelete = (taskList) => {
  return taskList.filter((task) => task.priority !== "delete");
};

/**
 * Group tasks by category with proper sorting
 * @param {Array} tasks - Tasks to group
 * @param {Array} categories - Available categories
 * @returns {Object} Grouped tasks by category
 */
export const groupTasksByCategory = (tasks, categories) => {
  const grouped = { "": [] }; // Initialize uncategorized group

  // Initialize all categories
  categories.forEach((category) => {
    grouped[category] = [];
  });

  // Group tasks by category
  tasks.forEach((task) => {
    const category = task.category || "";
    if (grouped.hasOwnProperty(category)) {
      grouped[category].push(task);
    } else {
      // Category doesn't exist in user's categories, add to uncategorized
      grouped[""].push(task);
    }
  });

  // Remove empty categories except uncategorized
  Object.keys(grouped).forEach((key) => {
    if (key !== "" && grouped[key].length === 0) {
      delete grouped[key];
    }
  });

  return grouped;
};

/**
 * Sort tasks by completion status
 * @param {Array} tasks - Tasks to sort
 * @returns {Array} Sorted tasks (incomplete first, then completed)
 */
export const sortTasksByCompletion = (tasks) => {
  return tasks.sort((a, b) => {
    // isDone: false (0) comes before isDone: true (1)
    if (a.isDone === b.isDone) {
      // If same completion status, sort by creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return a.isDone - b.isDone;
  });
};

// ================================
// TASK CHANGE DETECTION
// ================================

/**
 * Create a hash of task list for change detection
 * @param {Array} taskList - List of tasks
 * @returns {string} Hash representing the task list state
 */
export const createTasksHash = (taskList) => {
  const sortedTasks = taskList
    .map((task) => `${task.id}-${task.title}-${task.isDone}-${task.updatedAt}`)
    .sort()
    .join("|");
  return btoa(sortedTasks).slice(0, 32); // Simple hash
};

/**
 * Check if tasks have changed since last check
 * @param {Array} currentTasks - Current task list
 * @param {string} userId - User ID
 * @returns {boolean} True if tasks have changed
 */
export const haveTasksChanged = (currentTasks, userId) => {
  if (typeof window === "undefined" || !localStorage) return true;

  const currentHash = createTasksHash(currentTasks);
  const storedHash = localStorage.getItem(
    getStorageKey(userId, "lastTasksHash")
  );

  return currentHash !== storedHash;
};

/**
 * Store current tasks hash for change detection
 * @param {Array} taskList - Current task list
 * @param {string} userId - User ID
 */
export const storeCurrentTasksHash = (taskList, userId) => {
  if (typeof window !== "undefined" && localStorage) {
    const currentHash = createTasksHash(taskList);
    localStorage.setItem(getStorageKey(userId, "lastTasksHash"), currentHash);
  }
};

// ================================
// AI INTEGRATION FUNCTIONS
// ================================

/**
 * Prioritize tasks using AI service
 * @param {Array} tasks - Tasks to prioritize
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Prioritized tasks response
 */
export const prioritizeTasks = async (tasks, userId) => {
  return handleAsyncOperation(async () => {
    const response = await fetch("/api/prioritize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks, userId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }, "Failed to prioritize tasks");
};

/**
 * Schedule tasks using AI service
 * @param {string} userId - User ID
 * @param {boolean} forceReschedule - Force rescheduling of all tasks
 * @returns {Promise<Object>} Scheduled tasks response
 */
export const scheduleTasks = async (userId, forceReschedule = false) => {
  return handleAsyncOperation(async () => {
    const response = await fetch("/api/scheduling", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, forceReschedule }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }, "Failed to schedule tasks");
};

// ================================
// DATE FORMATTING FUNCTIONS
// ================================

/**
 * Format timestamp for datetime-local input
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Formatted datetime string
 */
export const formatDateTimeLocal = (timestamp) => {
  if (!timestamp) return "";

  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formatting datetime:", error);
    return "";
  }
};

/**
 * Format timestamp for date input
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return "";

  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

// ================================
// REAL-TIME TASK UPDATES
// ================================

/**
 * Setup real-time listener for user tasks (MongoDB change streams could be used here in the future)
 * For now, we'll use polling or webhooks
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function for task updates
 * @returns {Function} Cleanup function
 */
export const setupTasksListener = (userId, callback) => {
  // For MongoDB, we can implement this with change streams or polling
  // For now, returning a no-op cleanup function
  let intervalId;

  const pollTasks = async () => {
    try {
      const tasks = await getUserTasks(userId);
      callback({ tasks, error: null });
    } catch (error) {
      console.error("Error polling tasks:", error);
      callback({ tasks: [], error: error.message || "Failed to fetch tasks" });
    }
  };

  // Initial fetch
  pollTasks();

  // Poll every 30 seconds (can be optimized)
  intervalId = setInterval(pollTasks, 30000);

  // Return cleanup function
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
};

/**
 * Update prioritized tasks state with new priority
 * @param {Object} prioritizedTasks - Current prioritized tasks state
 * @param {string} taskId - Task ID to update
 * @param {string} newPriority - New priority value
 * @returns {Object} Updated prioritized tasks state
 */
export const updatePrioritizedTasksState = (
  prioritizedTasks,
  taskId,
  newPriority
) => {
  if (!prioritizedTasks) return null;

  const updatedState = { ...prioritizedTasks };

  // Remove task from all quadrants first
  ["do", "plan", "delegate", "delete"].forEach((quadrant) => {
    if (updatedState[quadrant]) {
      updatedState[quadrant] = updatedState[quadrant].filter(
        (id) => id !== taskId
      );
    }
  });

  // Add task to new quadrant if it's not being deleted
  if (newPriority && newPriority !== "delete") {
    if (!updatedState[newPriority]) {
      updatedState[newPriority] = [];
    }
    updatedState[newPriority].push(taskId);
  }

  return updatedState;
};

// ================================
// DATABASE SYNC FUNCTIONS
// ================================

/**
 * Update database with priority assignments from AI
 * @param {Array} allUserTasks - All user tasks
 * @param {Object} prioritizedTasks - AI prioritization results
 * @returns {Promise} Promise that resolves when updates are complete
 */
export const updateDatabaseWithPriorities = async (
  allUserTasks,
  prioritizedTasks
) => {
  if (!prioritizedTasks || !allUserTasks || allUserTasks.length === 0) {
    return;
  }

  return handleAsyncOperation(async () => {
    const bulkOps = [];

    // Process each quadrant
    ["do", "plan", "delegate", "delete"].forEach((quadrant) => {
      const taskIds = prioritizedTasks[quadrant] || [];

      taskIds.forEach((taskId, index) => {
        const task = allUserTasks.find((t) => t.id === taskId);
        if (task) {
          bulkOps.push({
            updateOne: {
              filter: { _id: taskId },
              update: {
                priority: quadrant,
                inGroupRank: index + 1,
                updatedAt: new Date(),
              },
            },
          });
        }
      });
    });

    if (bulkOps.length > 0) {
      await connectToDatabase();
      return Task.bulkWrite(bulkOps);
    }
  }, "Failed to update database with priorities");
};

/**
 * Get all tasks for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Promise that resolves with user tasks
 */
export const getUserTasks = async (userId) => {
  return handleAsyncOperation(async () => {
    const tasks = await fetchUserTasks(userId);
    return tasks.map((task) => ({
      ...task,
      id: task._id.toString(),
    }));
  }, "Failed to fetch user tasks");
};

/**
 * Update tasks with scheduling information
 * @param {Array} scheduledTasks - Tasks with scheduling info
 * @returns {Promise} Promise that resolves when updates are complete
 */
export const updateTasksWithScheduling = async (scheduledTasks) => {
  if (!scheduledTasks || scheduledTasks.length === 0) return;

  return handleAsyncOperation(async () => {
    const updatePromises = scheduledTasks.map((task) => {
      return updateTaskApi(task.id, {
        startDate: task.startDate,
        endDate: task.endDate,
        updatedAt: new Date(),
      });
    });

    return Promise.all(updatePromises);
  }, "Failed to update tasks with scheduling");
};

/**
 * Store Google Calendar event mapping
 * @param {string} taskId - Task ID
 * @param {string} googleEventId - Google Calendar event ID
 * @returns {Promise} Promise that resolves when mapping is stored
 */
export const storeGoogleCalendarEventMapping = async (
  taskId,
  googleEventId
) => {
  return handleAsyncOperation(async () => {
    return updateTaskApi(taskId, {
      googleCalendarEventId: googleEventId,
      syncedToGoogleCalendar: true,
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    });
  }, "Failed to store Google Calendar event mapping");
};

/**
 * Update tasks that have null priority values
 * @param {string} userId - User ID
 * @returns {Promise} Promise that resolves when null priority tasks are updated
 */
export const updateNullPriorityTasks = async (userId) => {
  return handleAsyncOperation(async () => {
    // Get tasks with null priority
    const tasks = await fetchUserTasks(userId, {
      isDone: false,
    });

    const tasksWithNullPriority = tasks.filter(
      (task) => task.priority === null
    );

    if (tasksWithNullPriority.length === 0) {
      return { message: "No tasks with null priority found", count: 0 };
    }

    // For now, assign them to 'plan' quadrant with sequential ranks
    const updatePromises = tasksWithNullPriority.map((task, index) =>
      updateTaskApi(task._id, {
        priority: "plan",
        inGroupRank: index + 1,
        updatedAt: new Date(),
      })
    );

    await Promise.all(updatePromises);

    return {
      message: `Updated ${tasksWithNullPriority.length} tasks with null priority`,
      count: tasksWithNullPriority.length,
    };
  }, "Failed to update null priority tasks");
};

/**
 * Check for tasks with null priority values
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Promise that resolves with null priority task info
 */
export const checkNullPriorityTasks = async (userId) => {
  return handleAsyncOperation(async () => {
    // Get all active tasks
    const tasks = await fetchUserTasks(userId, {
      isDone: false,
    });

    const nullPriorityCount = tasks.filter(
      (task) => task.priority === null
    ).length;

    const nullInGroupRankCount = tasks.filter(
      (task) =>
        task.inGroupRank === null &&
        (task.priority === "do" || task.priority === "plan")
    ).length;

    return {
      nullPriority: nullPriorityCount,
      nullInGroupRank: nullInGroupRankCount,
      hasIssues: nullPriorityCount > 0 || nullInGroupRankCount > 0,
    };
  }, "Failed to check null priority tasks");
};

/**
 * Fix all tasks with null priority values (admin function)
 * @returns {Promise<Object>} Promise that resolves with fix results
 */
export const fixAllNullPriorityTasks = async () => {
  return handleAsyncOperation(async () => {
    await connectToDatabase();

    // Get all tasks with null priority
    const tasksWithNullPriority = await Task.find({
      priority: null,
      isDone: false,
    });

    if (tasksWithNullPriority.length === 0) {
      return { message: "No tasks with null priority found", count: 0 };
    }

    // Group by user ID
    const tasksByUser = {};
    tasksWithNullPriority.forEach((task) => {
      if (!tasksByUser[task.userId]) {
        tasksByUser[task.userId] = [];
      }
      tasksByUser[task.userId].push(task);
    });

    let totalUpdated = 0;
    const bulkOps = [];

    // Process each user's tasks
    Object.keys(tasksByUser).forEach((userId) => {
      const userTasks = tasksByUser[userId];

      userTasks.forEach((task, index) => {
        bulkOps.push({
          updateOne: {
            filter: { _id: task._id },
            update: {
              priority: "plan",
              inGroupRank: index + 1,
              updatedAt: new Date(),
            },
          },
        });
        totalUpdated++;
      });
    });

    const result = await Task.bulkWrite(bulkOps);

    return {
      message: `Fixed ${totalUpdated} tasks with null priority across ${
        Object.keys(tasksByUser).length
      } users`,
      count: totalUpdated,
      usersAffected: Object.keys(tasksByUser).length,
      result,
    };
  }, "Failed to fix null priority tasks");
};
