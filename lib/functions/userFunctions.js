import { handleAsyncOperation } from "@/lib/functions/taskFunctions";
import { canAccessFeature } from "@/lib/utils/subscription-utils";
import { initializeGoogleCalendarSettings } from "@/lib/functions/googleCalendarFunctions";
import {
  getUserById,
  updateUserApi,
  createUserApi,
  updateTaskApi,
  getUserTasks,
  deleteTaskApi,
} from "./dbApi";

// ================================
// HELPER FUNCTIONS (DRY Implementation)
// ================================

/**
 * Update a user document with automatic timestamp
 * @param {string} userId - User ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise} Promise that resolves when user is updated
 */
const updateUserDoc = async (userId, updates) => {
  return updateUserApi(userId, {
    ...updates,
    updatedAt: new Date(),
  });
};

/**
 * Validate category name input
 * @param {string} categoryName - Category name to validate
 * @param {Array} existingCategories - Existing categories to check against
 * @param {string} excludeCategory - Category to exclude from duplicate check (for editing)
 * @returns {string} Trimmed category name if valid
 * @throws {Error} If validation fails
 */
const validateCategoryName = (
  categoryName,
  existingCategories,
  excludeCategory = null
) => {
  if (!categoryName || !categoryName.trim()) {
    throw new Error("Category name cannot be empty");
  }

  const trimmedCategory = categoryName.trim();

  // Check if category already exists (case insensitive)
  const categoryExists = existingCategories.some(
    (cat) =>
      cat.toLowerCase() === trimmedCategory.toLowerCase() &&
      cat !== excludeCategory
  );

  if (categoryExists) {
    throw new Error("Category already exists");
  }

  return trimmedCategory;
};

/**
 * Update tasks with a specific category using bulk write
 * @param {string} userId - User ID
 * @param {string} oldCategory - Old category name
 * @param {string} newCategory - New category name (empty string for uncategorized)
 * @returns {Promise} Promise that resolves when tasks are updated
 */
const updateTasksCategory = async (userId, oldCategory, newCategory) => {
  // Get all tasks with the old category
  const tasks = await getUserTasks(userId, { category: oldCategory });

  // Update each task with the new category
  const updatePromises = tasks.map((task) =>
    updateTaskApi(task._id, { category: newCategory, updatedAt: new Date() })
  );

  // Wait for all updates to complete
  await Promise.all(updatePromises);

  return { modifiedCount: updatePromises.length };
};

// ================================
// CATEGORY MANAGEMENT FUNCTIONS
// ================================

/**
 * Delete a category from user's categories and update related tasks
 * @param {string} userId - User ID
 * @param {string} categoryToDelete - Category name to delete
 * @param {Array} currentCategories - Current user categories
 * @returns {Promise} Promise that resolves when category is deleted
 */
export const deleteCategory = async (
  userId,
  categoryToDelete,
  currentCategories
) => {
  return handleAsyncOperation(async () => {
    // Remove the category from user's categories array
    const updatedCategories = currentCategories.filter(
      (cat) => cat !== categoryToDelete
    );

    // Update user document
    await updateUserDoc(userId, { categories: updatedCategories });

    // Update all tasks with this category to have no category
    await updateTasksCategory(userId, categoryToDelete, "");

    return { success: true };
  }, "Failed to delete category");
};

/**
 * Add a new category to user's categories
 * @param {string} userId - User ID
 * @param {string} newCategory - New category name to add
 * @param {Array} currentCategories - Current user categories
 * @returns {Promise} Promise that resolves when category is added
 */
export const addCategory = async (userId, newCategory, currentCategories) => {
  return handleAsyncOperation(async () => {
    const trimmedCategory = validateCategoryName(
      newCategory,
      currentCategories
    );

    // Add the new category to user's categories array
    const updatedCategories = [...currentCategories, trimmedCategory];

    // Update user document
    await updateUserDoc(userId, { categories: updatedCategories });

    return { success: true, category: trimmedCategory };
  }, "Failed to add category");
};

/**
 * Edit an existing category name
 * @param {string} userId - User ID
 * @param {string} oldCategoryName - Current category name
 * @param {string} newCategoryName - New category name
 * @param {Array} currentCategories - Current user categories
 * @returns {Promise} Promise that resolves when category is edited
 */
export const editCategory = async (
  userId,
  oldCategoryName,
  newCategoryName,
  currentCategories
) => {
  return handleAsyncOperation(async () => {
    const trimmedNewCategory = validateCategoryName(
      newCategoryName,
      currentCategories,
      oldCategoryName
    );

    // Check if the new name is the same as the old name
    if (trimmedNewCategory === oldCategoryName) {
      return { success: true, category: trimmedNewCategory };
    }

    // Update the category name in user's categories array
    const updatedCategories = currentCategories.map((cat) =>
      cat === oldCategoryName ? trimmedNewCategory : cat
    );

    // Update user document
    await updateUserDoc(userId, { categories: updatedCategories });

    // Update all tasks with the old category name
    await updateTasksCategory(userId, oldCategoryName, trimmedNewCategory);

    return { success: true, category: trimmedNewCategory };
  }, "Failed to edit category");
};

// ================================
// USER PROFILE FUNCTIONS
// ================================

/**
 * Update user profile information
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data to update
 * @param {string} profileData.fullName - User's full name
 * @returns {Promise} Promise that resolves when profile is updated
 */
export const updateUserProfile = async (userId, profileData) => {
  return handleAsyncOperation(
    () => updateUserDoc(userId, profileData),
    "Failed to update profile"
  );
};

/**
 * Update user's LemonSqueezy payment information after successful payment
 * @param {string} userId - User ID
 * @param {string} customerId - LemonSqueezy customer ID
 * @param {string} variantId - LemonSqueezy variant ID
 * @param {boolean} hasAccess - Whether user has access to premium features
 * @returns {Promise} Promise that resolves when payment info is updated
 */
export const updateUserPaymentInfo = async (
  userId,
  customerId,
  variantId,
  hasAccess = true
) => {
  return handleAsyncOperation(async () => {
    await updateUserDoc(userId, {
      customerId,
      variantId,
      hasAccess,
    });

    return { success: true };
  }, "Failed to update payment info");
};

/**
 * Update user's scheduling rules
 * @param {string} userId - User ID
 * @param {Object} schedulingRules - Updated scheduling rules
 * @returns {Promise} Promise that resolves with updated user
 */
export const updateSchedulingRules = async (userId, schedulingRules) => {
  return handleAsyncOperation(async () => {
    return updateUserDoc(userId, { schedulingRules });
  }, "Failed to update scheduling rules");
};

/**
 * Update user's prioritizing rules
 * @param {string} userId - User ID
 * @param {Object} prioritizingRules - Updated prioritizing rules
 * @returns {Promise} Promise that resolves with updated user
 */
export const updatePrioritizingRules = async (userId, prioritizingRules) => {
  return handleAsyncOperation(async () => {
    return updateUserDoc(userId, { prioritizingRules });
  }, "Failed to update prioritizing rules");
};

// ================================
// ADMIN FUNCTIONS
// ================================

/**
 * Check if a user has admin privileges
 * @param {string} uid - User ID to check
 * @returns {Promise<boolean>} Promise that resolves with admin status
 */
export const checkAdminStatus = async (uid) => {
  if (!uid) return false;

  return handleAsyncOperation(async () => {
    const user = await getUserById(uid);
    return user && user.isAdmin === true;
  }, "Error checking admin status").catch(() => false); // Return false on error
};

// ================================
// USER DATA FUNCTIONS
// ================================

/**
 * Get user data from API
 * @param {string} uid - User ID
 * @returns {Promise} Promise that resolves with user data or null
 */
export const getUserData = async (uid) => {
  return handleAsyncOperation(async () => {
    try {
      const user = await getUserById(uid);
      return user || null;
    } catch (error) {
      if (error.message.includes("not found")) {
        return null;
      }
      throw error;
    }
  }, "Error fetching user data").catch(() => null); // Return null on error
};

/**
 * Create or fetch user data using API
 * @param {Object} user - Firebase auth user object
 * @param {string} user.uid - User ID
 * @param {string} user.email - User email
 * @param {string} user.displayName - User display name
 * @returns {Promise} Promise that resolves with user data
 */
export const createUser = async (user) => {
  return handleAsyncOperation(async () => {
    try {
      const existingUser = await getUserById(user.uid);
      return existingUser;
    } catch (error) {
      // User doesn't exist, so create a new one
      const newUserData = {
        _id: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        isAdmin: false,
        categories: [],
        customerId: null,
        variantId: null,
        hasAccess: false,
        pricingShown: false,
        aiPrioritizationTokensUsed: 0,
        aiSchedulingTokensUsed: 0,
        lastTokenReset: new Date().toISOString(),
        googleCalendar: {
          connected: false,
          accessToken: null,
          refreshToken: null,
          expiryDate: null,
          calendarId: null,
          calendarName: null,
          autoSync: false,
        },
        schedulingRules: {
          workingHours: { start: "09:00", end: "17:00" },
          workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
          bufferTime: 15,
          maxTasksPerDay: 8,
          breakDuration: 60,
          preferredTaskLength: 60,
        },
        prioritizingRules: {
          urgencyWeight: 0.4,
          importanceWeight: 0.6,
          considerDeadlines: true,
          deadlineThreshold: 3,
          considerEffort: true,
          highEffortPenalty: 0.2,
        },
      };

      const newUser = await createUserApi(newUserData);

      // Initialize Google Calendar settings separately for clean error handling
      try {
        await initializeGoogleCalendarSettings(user.uid);
      } catch (error) {
        console.error("Failed to initialize Google Calendar settings:", error);
        // Don't throw here - user creation should still succeed
      }

      return newUser;
    }
  }, "Failed to create/fetch user");
};

/**
 * Get user's prioritizing rules from the API
 * @param {string} userId - User ID
 * @returns {Promise<string>} User's prioritizing rules or empty string
 */
export const getUserPrioritizingRules = async (userId) => {
  return handleAsyncOperation(async () => {
    const user = await getUserById(userId);
    if (user) {
      return user.prioritizingRules || "";
    }
    return "";
  }, "Error fetching user prioritizing rules").catch(() => ""); // Return empty string on error
};

/**
 * Get user's scheduling rules from the API
 * @param {string} userId - User ID
 * @returns {Promise<string>} User's scheduling rules or empty string
 */
export const getUserSchedulingRules = async (userId) => {
  return handleAsyncOperation(async () => {
    const user = await getUserById(userId);
    if (user) {
      return user.schedulingRules || "";
    }
    return "";
  }, "Error fetching user scheduling rules").catch(() => ""); // Return empty string on error
};

// ================================
// USER COUNT FUNCTIONS
// ================================

/**
 * Get the total number of users in the system
 * @returns {Promise<number>} Promise that resolves with user count
 */
export const getUserCount = async () => {
  return handleAsyncOperation(async () => {
    // For this function, we'll need a special endpoint or query parameter
    // For now, we'll get all users and count them
    const response = await fetch("/api/db/users");
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch users");
    }

    return result.data.length;
  }, "Error fetching user count").catch(() => 0); // Return 0 on error
};

/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User data or null if not found
 */
export const findUserByEmail = async (email) => {
  return handleAsyncOperation(async () => {
    const response = await fetch(
      `/api/db/users?email=${encodeURIComponent(email)}`
    );
    const result = await response.json();

    if (!result.success) {
      return null;
    }

    return result.data.length > 0 ? result.data[0] : null;
  }, "Error finding user by email").catch(() => null);
};

/**
 * Find user by LemonSqueezy customer ID
 * @param {string} customerId - LemonSqueezy customer ID
 * @returns {Promise<Object|null>} User data or null if not found
 */
export const findUserByCustomerId = async (customerId) => {
  return handleAsyncOperation(async () => {
    const response = await fetch(
      `/api/db/users?customerId=${encodeURIComponent(customerId)}`
    );
    const result = await response.json();

    if (!result.success) {
      return null;
    }

    return result.data.length > 0 ? result.data[0] : null;
  }, "Error finding user by customer ID").catch(() => null);
};

/**
 * Mark that user has seen the pricing page
 * @param {string} userId - User ID
 * @returns {Promise} Promise that resolves when pricing is marked as shown
 */
export const markPricingAsShown = async (userId) => {
  return handleAsyncOperation(async () => {
    return updateUserDoc(userId, { pricingShown: true });
  }, "Failed to mark pricing as shown");
};
