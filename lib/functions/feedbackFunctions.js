import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Collection names
const FEEDBACK_COLLECTION = "feedback";

// Add new feedback/feature suggestion
export const addFeatureSuggestion = async (
  title,
  description,
  userId = null
) => {
  try {
    const docRef = await addDoc(collection(db, FEEDBACK_COLLECTION), {
      title,
      description,
      userId,
      votes: [],
      handled: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding feature suggestion:", error);
    return { success: false, error: error.message };
  }
};

// Get all feedback items with optional filtering
export const getFeedbackItems = async (handledFilter = null, limit = null) => {
  try {
    let feedbackQuery = collection(db, FEEDBACK_COLLECTION);

    if (handledFilter !== null) {
      feedbackQuery = query(
        feedbackQuery,
        where("handled", "==", handledFilter)
      );
    }

    // Order by creation date - we'll handle sorting by vote count in JavaScript
    feedbackQuery = query(feedbackQuery, orderBy("createdAt", "desc"));

    if (limit) {
      feedbackQuery = query(feedbackQuery, limit(limit));
    }

    const querySnapshot = await getDocs(feedbackQuery);
    const feedbackItems = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      feedbackItems.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        voteCount: Array.isArray(data.votes) ? data.votes.length : 0,
      });
    });

    return { success: true, data: feedbackItems };
  } catch (error) {
    console.error("Error fetching feedback items:", error);
    return { success: false, error: error.message };
  }
};

// Vote for a feature (add userId to votes array if not already present)
export const voteForFeature = async (feedbackId, userId) => {
  try {
    const feedbackRef = doc(db, FEEDBACK_COLLECTION, feedbackId);

    // Get current document to check if user already voted
    const docSnap = await getDocs(
      query(
        collection(db, FEEDBACK_COLLECTION),
        where("__name__", "==", feedbackId)
      )
    );

    if (docSnap.docs.length > 0) {
      const currentVotes = docSnap.docs[0].data().votes || [];

      if (!currentVotes.includes(userId)) {
        const newVotes = [...currentVotes, userId];
        await updateDoc(feedbackRef, {
          votes: newVotes,
          updatedAt: serverTimestamp(),
        });
        return { success: true };
      } else {
        return { success: false, error: "User has already voted" };
      }
    }

    return { success: false, error: "Document not found" };
  } catch (error) {
    console.error("Error voting for feature:", error);
    return { success: false, error: error.message };
  }
};

// Update feedback handled status (admin function)
export const updateFeedbackStatus = async (feedbackId, isHandled) => {
  try {
    const feedbackRef = doc(db, FEEDBACK_COLLECTION, feedbackId);
    await updateDoc(feedbackRef, {
      handled: isHandled,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating feedback status:", error);
    return { success: false, error: error.message };
  }
};

// Get feedback statistics
export const getFeedbackStats = async () => {
  try {
    const allFeedback = await getFeedbackItems();
    if (!allFeedback.success) {
      return allFeedback;
    }

    const stats = {
      total: allFeedback.data.length,
      handled: allFeedback.data.filter((item) => item.handled === true).length,
      pending: allFeedback.data.filter((item) => item.handled === false).length,
      totalVotes: allFeedback.data.reduce(
        (sum, item) => sum + (item.voteCount || 0),
        0
      ),
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error getting feedback statistics:", error);
    return { success: false, error: error.message };
  }
};
