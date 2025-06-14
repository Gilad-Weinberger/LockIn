import { db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";

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
  try {
    // Remove the category from user's categories array
    const updatedCategories = currentCategories.filter(
      (cat) => cat !== categoryToDelete
    );

    // Update user document
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      categories: updatedCategories,
      updatedAt: new Date().toISOString(),
    });

    // Find all tasks with this category and update them to have no category
    const tasksQuery = query(
      collection(db, "tasks"),
      where("userId", "==", userId),
      where("category", "==", categoryToDelete)
    );

    const tasksSnapshot = await getDocs(tasksQuery);

    if (!tasksSnapshot.empty) {
      const batch = writeBatch(db);

      tasksSnapshot.docs.forEach((taskDoc) => {
        const taskRef = doc(db, "tasks", taskDoc.id);
        batch.update(taskRef, {
          category: "", // Set to empty string to make them uncategorized
          updatedAt: new Date().toISOString(),
        });
      });

      await batch.commit();
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    throw new Error("Failed to delete category");
  }
};
