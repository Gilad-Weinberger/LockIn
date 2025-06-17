import { db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  getDoc,
  setDoc,
  getCountFromServer,
} from "firebase/firestore";
import { handleAsyncOperation, batchUpdateDocuments } from "./taskFunctions";

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
  return updateDoc(doc(db, "users", userId), {
    ...updates,
    updatedAt: serverTimestamp(),
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
 * Update tasks with a specific category using batch write
 * @param {string} userId - User ID
 * @param {string} oldCategory - Old category name
 * @param {string} newCategory - New category name (empty string for uncategorized)
 * @returns {Promise} Promise that resolves when tasks are updated
 */
const updateTasksCategory = async (userId, oldCategory, newCategory) => {
  const tasksQuery = query(
    collection(db, "tasks"),
    where("userId", "==", userId),
    where("category", "==", oldCategory)
  );

  const tasksSnapshot = await getDocs(tasksQuery);

  if (!tasksSnapshot.empty) {
    const batchUpdates = tasksSnapshot.docs.map((taskDoc) => ({
      collection: "tasks",
      docId: taskDoc.id,
      updates: { category: newCategory },
    }));

    await batchUpdateDocuments(batchUpdates, "Failed to update tasks category");
  }
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
 * @param {boolean} hasAccess - Whether user has access to paid features
 * @returns {Promise} Promise that resolves when payment info is updated
 */
export const updateUserPaymentInfo = async (
  userId,
  customerId,
  variantId,
  hasAccess = true
) => {
  return handleAsyncOperation(
    () =>
      updateUserDoc(userId, {
        lemonsqueezyCustomerId: customerId,
        lemonsqueezyVariantId: variantId,
        lemonsqueezyHasAccess: hasAccess,
      }),
    "Failed to update user payment information"
  );
};

/**
 * Update user scheduling rules
 * @param {string} userId - User ID
 * @param {string} schedulingRules - Scheduling rules text
 * @returns {Promise} Promise that resolves when scheduling rules are updated
 */
export const updateSchedulingRules = async (userId, schedulingRules) => {
  return handleAsyncOperation(
    () => updateUserDoc(userId, { schedulingRules }),
    "Failed to update scheduling rules"
  );
};

/**
 * Update user prioritizing rules
 * @param {string} userId - User ID
 * @param {string} prioritizingRules - Prioritizing rules text
 * @returns {Promise} Promise that resolves when prioritizing rules are updated
 */
export const updatePrioritizingRules = async (userId, prioritizingRules) => {
  return handleAsyncOperation(
    () => updateUserDoc(userId, { prioritizingRules }),
    "Failed to update prioritizing rules"
  );
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
    const userDoc = await getDoc(doc(db, "users", uid));
    console.log(userDoc.data());
    return userDoc.exists() && userDoc.data().role === "admin";
  }, "Error checking admin status").catch(() => false); // Return false on error
};

// ================================
// USER DATA FUNCTIONS
// ================================

/**
 * Get user data from Firestore
 * @param {string} uid - User ID
 * @returns {Promise} Promise that resolves with user data or null
 */
export const getUserData = async (uid) => {
  return handleAsyncOperation(async () => {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data() : null;
  }, "Error fetching user data").catch(() => null); // Return null on error instead of throwing
};

/**
 * Create or fetch user data in Firestore
 * @param {Object} user - Firebase auth user object
 * @param {string} user.uid - User ID
 * @param {string} user.email - User email
 * @param {string} user.displayName - User display name
 * @returns {Promise} Promise that resolves with user data
 */
export const createUser = async (user) => {
  return handleAsyncOperation(async () => {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const newUserData = {
        id: user.uid,
        email: user.email,
        fullName: user.displayName || "",
        role: "client",
        createdAt: new Date().toISOString(),
        lemonsqueezyCustomerId: null,
        lemonsqueezyVariantId: null,
        lemonsqueezyHasAccess: false,
        aiPrioritizationTokensUsed: 0,
        aiSchedulingTokensUsed: 0,
        lastTokenReset: new Date().toISOString(),
        categories: [],
        autoPrioritize: true, // Default to enabled
        autoSchedule: true, // Default to enabled
      };
      await setDoc(userRef, newUserData);
      return newUserData;
    } else {
      return userDoc.data();
    }
  }, "Failed to create/fetch user");
};

/**
 * Get user's prioritizing rules from the database
 * @param {string} userId - User ID
 * @returns {Promise<string>} User's prioritizing rules or empty string
 */
export const getUserPrioritizingRules = async (userId) => {
  return handleAsyncOperation(async () => {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data().prioritizingRules || "";
    }
    return "";
  }, "Error fetching user prioritizing rules").catch(() => ""); // Return empty string on error
};

/**
 * Get user's scheduling rules from the database
 * @param {string} userId - User ID
 * @returns {Promise<string>} User's scheduling rules or empty string
 */
export const getUserSchedulingRules = async (userId) => {
  return handleAsyncOperation(async () => {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data().schedulingRules || "";
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
    const usersRef = collection(db, "users");
    const snapshot = await getCountFromServer(usersRef);
    return snapshot.data().count;
  }, "Error fetching user count").catch(() => 0); // Return 0 on error
};
