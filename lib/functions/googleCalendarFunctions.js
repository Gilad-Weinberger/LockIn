import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { handleAsyncOperation } from "@/lib/functions/taskFunctions";

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Update user's Google Calendar settings
 * @param {string} userId - User ID
 * @param {Object} updates - Updates to apply to googleCalendar field
 * @returns {Promise} Promise that resolves when user is updated
 */
const updateUserGoogleCalendar = async (userId, updates) => {
  const userDoc = await getDoc(doc(db, "users", userId));
  const currentData = userDoc.data();

  const updatedGoogleCalendar = {
    ...currentData.googleCalendar,
    ...updates,
  };

  return updateDoc(doc(db, "users", userId), {
    googleCalendar: updatedGoogleCalendar,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Encrypt sensitive data (basic implementation)
 * In production, use proper encryption
 * @param {string} data - Data to encrypt
 * @returns {string} Encrypted data
 */
const encryptData = (data) => {
  // Basic base64 encoding - replace with proper encryption in production
  return Buffer.from(data).toString("base64");
};

/**
 * Decrypt sensitive data
 * @param {string} encryptedData - Encrypted data
 * @returns {string} Decrypted data
 */
const decryptData = (encryptedData) => {
  // Basic base64 decoding - replace with proper decryption in production
  return Buffer.from(encryptedData, "base64").toString();
};

// ================================
// GOOGLE CALENDAR CONNECTION FUNCTIONS
// ================================

/**
 * Connect user's Google Calendar account
 * @param {string} userId - User ID
 * @param {Object} tokens - OAuth tokens from Google
 * @param {Object} calendarInfo - Calendar information
 * @returns {Promise} Promise that resolves when connection is saved
 */
export const connectGoogleCalendar = async (userId, tokens, calendarInfo) => {
  return handleAsyncOperation(async () => {
    const googleCalendarData = {
      connected: true,
      accessToken: encryptData(tokens.access_token),
      refreshToken: tokens.refresh_token
        ? encryptData(tokens.refresh_token)
        : null,
      expiryDate: tokens.expiry_date || null,
      calendarId: "primary",
      calendarName: calendarInfo?.summary || "Primary Calendar",
      autoSync: false, // Default to false, user can enable if pro
      connectedAt: serverTimestamp(),
    };

    await updateUserGoogleCalendar(userId, googleCalendarData);

    return { success: true };
  }, "Failed to connect Google Calendar");
};

/**
 * Disconnect user's Google Calendar account
 * @param {string} userId - User ID
 * @returns {Promise} Promise that resolves when disconnection is complete
 */
export const disconnectGoogleCalendar = async (userId) => {
  return handleAsyncOperation(async () => {
    const googleCalendarData = {
      connected: false,
      accessToken: null,
      refreshToken: null,
      expiryDate: null,
      calendarId: null,
      calendarName: null,
      autoSync: false,
      connectedAt: null,
      disconnectedAt: serverTimestamp(),
    };

    await updateUserGoogleCalendar(userId, googleCalendarData);

    return { success: true };
  }, "Failed to disconnect Google Calendar");
};

/**
 * Update Google Calendar tokens
 * @param {string} userId - User ID
 * @param {Object} newTokens - New tokens from refresh
 * @returns {Promise} Promise that resolves when tokens are updated
 */
export const updateGoogleCalendarTokens = async (userId, newTokens) => {
  return handleAsyncOperation(async () => {
    const updates = {
      accessToken: encryptData(newTokens.access_token),
      expiryDate: newTokens.expiry_date || null,
    };

    if (newTokens.refresh_token) {
      updates.refreshToken = encryptData(newTokens.refresh_token);
    }

    await updateUserGoogleCalendar(userId, updates);

    return { success: true };
  }, "Failed to update Google Calendar tokens");
};

/**
 * Toggle auto-sync setting for Google Calendar
 * @param {string} userId - User ID
 * @param {boolean} autoSync - Auto-sync enabled/disabled
 * @returns {Promise} Promise that resolves when setting is updated
 */
export const updateGoogleCalendarAutoSync = async (userId, autoSync) => {
  return handleAsyncOperation(async () => {
    await updateUserGoogleCalendar(userId, { autoSync });

    return { success: true };
  }, "Failed to update auto-sync setting");
};

/**
 * Get user's Google Calendar connection data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User's Google Calendar data
 */
export const getUserGoogleCalendarData = async (userId) => {
  return handleAsyncOperation(async () => {
    const userDoc = await getDoc(doc(db, "users", userId));
    const userData = userDoc.data();

    if (!userData?.googleCalendar) {
      return {
        connected: false,
        autoSync: false,
      };
    }

    const googleCalendarData = userData.googleCalendar;

    // Return data with decrypted tokens for API calls
    return {
      connected: googleCalendarData.connected || false,
      accessToken: googleCalendarData.accessToken
        ? decryptData(googleCalendarData.accessToken)
        : null,
      refreshToken: googleCalendarData.refreshToken
        ? decryptData(googleCalendarData.refreshToken)
        : null,
      expiryDate: googleCalendarData.expiryDate,
      calendarId: googleCalendarData.calendarId || "primary",
      calendarName: googleCalendarData.calendarName,
      autoSync: googleCalendarData.autoSync || false,
      connectedAt: googleCalendarData.connectedAt,
    };
  }, "Failed to get Google Calendar data");
};

/**
 * Store Google Calendar event mapping
 * @param {string} userId - User ID
 * @param {string} taskId - Internal task ID
 * @param {string} googleEventId - Google Calendar event ID
 * @returns {Promise} Promise that resolves when mapping is stored
 */
export const storeGoogleCalendarEventMapping = async (
  userId,
  taskId,
  googleEventId
) => {
  return handleAsyncOperation(async () => {
    // For now, we'll store this in the task document
    // In a larger scale app, consider a separate collection
    await updateDoc(doc(db, "tasks", taskId), {
      googleCalendarEventId: googleEventId,
      syncedToGoogleCalendar: true,
      lastSyncedAt: serverTimestamp(),
    });

    return { success: true };
  }, "Failed to store Google Calendar event mapping");
};

/**
 * Remove Google Calendar event mapping
 * @param {string} taskId - Internal task ID
 * @returns {Promise} Promise that resolves when mapping is removed
 */
export const removeGoogleCalendarEventMapping = async (taskId) => {
  return handleAsyncOperation(async () => {
    await updateDoc(doc(db, "tasks", taskId), {
      googleCalendarEventId: null,
      syncedToGoogleCalendar: false,
      lastSyncedAt: serverTimestamp(),
    });

    return { success: true };
  }, "Failed to remove Google Calendar event mapping");
};

/**
 * Initialize Google Calendar settings for new users
 * @param {string} userId - User ID
 * @returns {Promise} Promise that resolves when settings are initialized
 */
export const initializeGoogleCalendarSettings = async (userId) => {
  return handleAsyncOperation(async () => {
    const defaultGoogleCalendarData = {
      connected: false,
      accessToken: null,
      refreshToken: null,
      expiryDate: null,
      calendarId: null,
      calendarName: null,
      autoSync: false,
    };

    await updateUserGoogleCalendar(userId, defaultGoogleCalendarData);

    return { success: true };
  }, "Failed to initialize Google Calendar settings");
};

/**
 * Update Google Calendar settings (autoSync, showGoogleEvents)
 * @param {string} userId - User ID
 * @param {Object} settings - Settings to update
 * @param {boolean} [settings.autoSync] - Auto-sync enabled/disabled
 * @param {boolean} [settings.showGoogleEvents] - Show Google events in calendar
 * @returns {Promise} Promise that resolves when settings are updated
 */
export const updateGoogleCalendarSettings = async (userId, settings) => {
  return handleAsyncOperation(async () => {
    const updateData = {};

    if (typeof settings.autoSync === "boolean") {
      updateData.autoSync = settings.autoSync;
    }

    if (typeof settings.showGoogleEvents === "boolean") {
      updateData.showGoogleEvents = settings.showGoogleEvents;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error("No valid settings to update");
    }

    await updateUserGoogleCalendar(userId, updateData);

    return { success: true };
  }, "Failed to update Google Calendar settings");
};

/**
 * Get Google Calendar settings for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User's Google Calendar settings
 */
export const getGoogleCalendarSettings = async (userId) => {
  return handleAsyncOperation(async () => {
    const userDoc = await getDoc(doc(db, "users", userId));

    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();
    const googleCalendar = userData.googleCalendar || {};

    return {
      connected: googleCalendar.connected || false,
      autoSync: googleCalendar.autoSync || false,
      showGoogleEvents: googleCalendar.showGoogleEvents !== false, // Default to true
      calendarName: googleCalendar.calendarName || "",
      connectedAt: googleCalendar.connectedAt || null,
    };
  }, "Failed to get Google Calendar settings");
};
