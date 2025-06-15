import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  getDoc,
} from "firebase/firestore";

// ================================
// HELPER FUNCTIONS (DRY Elimination)
// ================================

/**
 * Generic error handler for async operations
 * @param {Function} operation - Async operation to execute
 * @param {string} errorMessage - Error message to throw on failure
 * @returns {Promise} Promise that resolves with operation result or throws error
 */
const handleAsyncOperation = async (operation, errorMessage) => {
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
  return updateDoc(doc(db, "tasks", taskId), {
    ...updates,
    updatedAt: serverTimestamp(),
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

// ================================
// TASK CRUD OPERATIONS
// ================================

/**
 * Create a new task and trigger re-prioritization
 * @param {Object} taskData - Task data object
 * @param {string} taskData.title - Task title
 * @param {string} taskData.taskDate - Task date
 * @param {string} taskData.category - Task category
 * @param {string} taskData.type - Task type (deadline or event)
 * @param {boolean} taskData.isDone - Task completion status
 * @param {string} userId - User ID
 * @returns {Promise} Promise that resolves when task is created
 */
export const createTask = async (taskData, userId) => {
  const result = await handleAsyncOperation(
    () =>
      addDoc(collection(db, "tasks"), {
        ...taskData,
        priority: null,
        inGroupRank: null,
        startDate: null,
        endDate: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId,
      }),
    "Failed to create task"
  );

  // Trigger re-prioritization by clearing the tasks hash
  // This will force the matrix page to re-prioritize all tasks
  if (typeof window !== "undefined" && localStorage) {
    localStorage.removeItem(getStorageKey(userId, "lastPrioritizedTasks"));
  }

  return result;
};

/**
 * Update an existing task and trigger re-prioritization
 * @param {string} taskId - Task ID
 * @param {Object} updates - Object containing fields to update
 * @returns {Promise} Promise that resolves when task is updated
 */
export const updateTask = async (taskId, updates) => {
  // Get the task to find the userId
  let userId = null;
  try {
    const taskDoc = await getDoc(doc(db, "tasks", taskId));
    if (taskDoc.exists()) {
      userId = taskDoc.data().userId;
    }
  } catch (error) {
    console.error("Error getting task for userId:", error);
  }

  const result = await handleAsyncOperation(
    () => updateTaskDoc(taskId, updates),
    "Failed to update task"
  );

  // Trigger re-prioritization by clearing the tasks hash
  // This will force the matrix page to re-prioritize all tasks
  if (userId && typeof window !== "undefined" && localStorage) {
    localStorage.removeItem(getStorageKey(userId, "lastPrioritizedTasks"));
  }

  return result;
};

/**
 * Delete a task
 * @param {string} taskId - Task ID
 * @returns {Promise} Promise that resolves when task is deleted
 */
export const deleteTask = async (taskId) => {
  return handleAsyncOperation(
    () => deleteDoc(doc(db, "tasks", taskId)),
    "Failed to delete task"
  );
};

/**
 * Toggle task completion status and trigger re-prioritization
 * @param {string} taskId - Task ID
 * @param {boolean} currentStatus - Current isDone status
 * @returns {Promise} Promise that resolves when task status is updated
 */
export const toggleTaskDone = async (taskId, currentStatus) => {
  // Get the task to find the userId
  let userId = null;
  try {
    const taskDoc = await getDoc(doc(db, "tasks", taskId));
    if (taskDoc.exists()) {
      userId = taskDoc.data().userId;
    }
  } catch (error) {
    console.error("Error getting task for userId:", error);
  }

  const result = await handleAsyncOperation(
    () => updateTaskDoc(taskId, { isDone: !currentStatus }),
    "Failed to update task status"
  );

  // Trigger re-prioritization by clearing the tasks hash
  // This will force the matrix page to re-prioritize all tasks
  if (userId && typeof window !== "undefined" && localStorage) {
    localStorage.removeItem(getStorageKey(userId, "lastPrioritizedTasks"));
  }

  return result;
};

// ================================
// TASK PRIORITIZATION FUNCTIONS
// ================================

/**
 * Update task priority and inGroupRank position using batch write
 * @param {string} taskId - Task ID
 * @param {string} priority - New priority (do, plan, delegate, delete)
 * @param {number} inGroupRank - InGroupRank priority position
 * @returns {Promise} Promise that resolves when task priority is updated
 */
export const updateTaskPriority = async (taskId, priority, inGroupRank) => {
  return handleAsyncOperation(async () => {
    const batch = writeBatch(db);
    const taskRef = doc(db, "tasks", taskId);

    batch.update(taskRef, {
      priority,
      inGroupRank,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  }, "Failed to update task priority");
};

/**
 * Update multiple tasks using batch write for maximum performance
 * @param {Array} taskUpdates - Array of {taskId, updates} objects
 * @returns {Promise} Promise that resolves when all tasks are updated
 */
const updateMultipleTasks = async (taskUpdates) => {
  if (taskUpdates.length === 0) return;

  const batch = writeBatch(db);
  const timestamp = serverTimestamp();

  taskUpdates.forEach(({ taskId, updates }) => {
    const taskRef = doc(db, "tasks", taskId);
    batch.update(taskRef, {
      ...updates,
      updatedAt: timestamp,
    });
  });

  await batch.commit();
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
    const batch = writeBatch(db);
    const timestamp = serverTimestamp();

    // Update the moving task first
    const movingTaskRef = doc(db, "tasks", movingTaskId);
    batch.update(movingTaskRef, {
      inGroupRank: newPosition,
      updatedAt: timestamp,
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
          const taskRef = doc(db, "tasks", task.id);
          batch.update(taskRef, {
            inGroupRank: task.inGroupRank + 1,
            updatedAt: timestamp,
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
          const taskRef = doc(db, "tasks", task.id);
          batch.update(taskRef, {
            inGroupRank: task.inGroupRank - 1,
            updatedAt: timestamp,
          });
        }
      });
    }

    // Execute all updates in a single batch commit
    await batch.commit();
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
 * Fallback logic for distributing tasks when no priorities are set
 * @param {Array} allTasks - All tasks
 * @param {string} quadrantType - Quadrant type
 * @returns {Array} Tasks for the specified quadrant
 */
export const getFallbackTasks = (allTasks, quadrantType) => {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const filterMap = {
    do: (task) => task.taskDate && task.taskDate <= today && !task.priority,
    plan: (task) => task.taskDate && task.taskDate > today && !task.priority,
    delegate: (task) =>
      !task.taskDate && !task.priority && hasDelegateKeywords(task),
    delete: (task) =>
      !task.taskDate && !task.priority && !hasDelegateKeywords(task),
  };

  return filterTasks(allTasks, filterMap[quadrantType] || (() => false));
};

/**
 * Filter tasks excluding delete priority
 * @param {Array} taskList - List of tasks
 * @returns {Array} Tasks excluding delete priority
 */
export const getTasksExcludingDelete = (taskList) => {
  return filterTasks(taskList, (task) => task.priority !== "delete");
};

/**
 * Group tasks by category
 * @param {Array} tasks - Tasks to group
 * @param {Array} categories - Available categories
 * @returns {Object} Object with tasks grouped by category
 */
export const groupTasksByCategory = (tasks, categories) => {
  const tasksByCategory = categories.reduce((acc, cat) => {
    acc[cat] = [];
    return acc;
  }, {});

  const { categorized, uncategorized } = tasks.reduce(
    (acc, task) => {
      if (task.category && categories.includes(task.category)) {
        tasksByCategory[task.category].push(task);
        acc.categorized.push(task);
      } else {
        acc.uncategorized.push(task);
      }
      return acc;
    },
    { categorized: [], uncategorized: [] }
  );

  return { tasksByCategory, uncategorized };
};

/**
 * Sort tasks: not done first, then done
 * @param {Array} tasks - Tasks to sort
 * @returns {Array} Sorted tasks
 */
export const sortTasksByCompletion = (tasks) => {
  const { done, notDone } = tasks.reduce(
    (acc, task) => {
      acc[task.isDone ? "done" : "notDone"].push(task);
      return acc;
    },
    { done: [], notDone: [] }
  );

  return [...notDone, ...done];
};

// ================================
// TASK CHANGE DETECTION
// ================================

/**
 * Create a hash of tasks for comparison (excluding delete priority)
 * @param {Array} taskList - List of tasks
 * @returns {string} Hash string for comparison
 */
export const createTasksHash = (taskList) => {
  const relevantTasks = getTasksExcludingDelete(taskList);
  return relevantTasks
    .map((task) => `${task.id}-${task.title}-${task.taskDate}`)
    .sort()
    .join("|");
};

/**
 * Check if tasks have changed since last prioritization
 * @param {Array} currentTasks - Current task list
 * @param {string} userId - User ID
 * @returns {boolean} True if tasks have changed
 */
export const haveTasksChanged = (currentTasks, userId) => {
  if (!userId) return false;

  const lastPrioritizedHash = localStorage.getItem(
    getStorageKey(userId, "lastPrioritizedTasks")
  );
  const currentHash = createTasksHash(currentTasks);

  return lastPrioritizedHash !== currentHash;
};

/**
 * Store the current tasks hash after prioritization
 * @param {Array} taskList - List of tasks
 * @param {string} userId - User ID
 */
export const storeCurrentTasksHash = (taskList, userId) => {
  if (userId) {
    const currentHash = createTasksHash(taskList);
    localStorage.setItem(
      getStorageKey(userId, "lastPrioritizedTasks"),
      currentHash
    );
  }
};

// ================================
// TASK API OPERATIONS
// ================================

/**
 * Call prioritization API
 * @param {Array} tasks - Tasks to prioritize
 * @param {string} userId - User ID
 * @returns {Promise} Promise that resolves with prioritization result
 */
export const prioritizeTasks = async (tasks, userId) => {
  return handleAsyncOperation(async () => {
    const response = await fetch("/api/prioritize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tasks, userId }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `API returned ${response.status}`);
    }

    return await response.json();
  }, "Failed to prioritize tasks");
};

/**
 * Call scheduling API to schedule tasks
 * @param {string} userId - User ID
 * @param {boolean} forceReschedule - Whether to reschedule all tasks (including already scheduled ones)
 * @returns {Promise} Promise that resolves with scheduling result
 */
export const scheduleTasks = async (userId, forceReschedule = false) => {
  return handleAsyncOperation(async () => {
    const response = await fetch("/api/scheduling", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, forceReschedule }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `API returned ${response.status}`);
    }

    return await response.json();
  }, "Failed to schedule tasks");
};

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Format timestamp to readable date
 * @param {Object|string} timestamp - Timestamp to format
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return "-";

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Set up real-time task listener
 * @param {Function} callback - Callback function to handle task updates
 * @returns {Function} Unsubscribe function
 */
export const setupTasksListener = (callback) => {
  const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (querySnapshot) => {
      const tasks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback({ tasks, error: null });
    },
    (error) => {
      console.error("Error in tasks listener:", error);
      callback({ tasks: [], error: "Failed to load tasks" });
    }
  );
};

/**
 * Update prioritized tasks state after task movement
 * @param {Object} prioritizedTasks - Current prioritized tasks state
 * @param {string} taskId - ID of moved task
 * @param {string} newPriority - New priority quadrant
 * @returns {Object} Updated prioritized tasks state
 */
export const updatePrioritizedTasksState = (
  prioritizedTasks,
  taskId,
  newPriority
) => {
  if (!prioritizedTasks) return prioritizedTasks;

  const newState = { ...prioritizedTasks };

  // Remove task from all quadrants first
  Object.keys(newState).forEach((quadrant) => {
    if (newState[quadrant]) {
      newState[quadrant] = newState[quadrant].filter((id) => id !== taskId);
    }
  });

  // Add task to the new quadrant
  if (!newState[newPriority]) {
    newState[newPriority] = [];
  }
  newState[newPriority].push(taskId);

  return newState;
};

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
