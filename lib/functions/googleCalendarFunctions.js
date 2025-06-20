import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import Task from "@/lib/models/Task";
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
  await connectToDatabase();

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const updatedGoogleCalendar = {
    ...user.googleCalendar,
    ...updates,
  };

  return User.findByIdAndUpdate(
    userId,
    {
      googleCalendar: updatedGoogleCalendar,
      updatedAt: new Date(),
    },
    { new: true }
  );
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
      connectedAt: new Date(),
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
      disconnectedAt: new Date(),
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
    await connectToDatabase();
    const user = await User.findById(userId);

    if (!user?.googleCalendar) {
      return {
        connected: false,
        autoSync: false,
      };
    }

    const googleCalendarData = user.googleCalendar;

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
    await connectToDatabase();

    await Task.findByIdAndUpdate(taskId, {
      googleCalendarEventId: googleEventId,
      syncedToGoogleCalendar: true,
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true };
  }, "Failed to store Google Calendar event mapping");
};

/**
 * Remove Google Calendar event mapping from a task
 * @param {string} taskId - Internal task ID
 * @returns {Promise} Promise that resolves when mapping is removed
 */
export const removeGoogleCalendarEventMapping = async (taskId) => {
  return handleAsyncOperation(async () => {
    await connectToDatabase();

    await Task.findByIdAndUpdate(taskId, {
      googleCalendarEventId: null,
      syncedToGoogleCalendar: false,
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true };
  }, "Failed to remove Google Calendar event mapping");
};

/**
 * Initialize Google Calendar settings for a new user
 * @param {string} userId - User ID
 * @returns {Promise} Promise that resolves when settings are initialized
 */
export const initializeGoogleCalendarSettings = async (userId) => {
  return handleAsyncOperation(async () => {
    const defaultGoogleCalendarSettings = {
      connected: false,
      accessToken: null,
      refreshToken: null,
      expiryDate: null,
      calendarId: null,
      calendarName: null,
      autoSync: false,
    };

    await updateUserGoogleCalendar(userId, defaultGoogleCalendarSettings);

    return { success: true };
  }, "Failed to initialize Google Calendar settings");
};

/**
 * Update Google Calendar settings
 * @param {string} userId - User ID
 * @param {Object} settings - Settings to update
 * @returns {Promise} Promise that resolves when settings are updated
 */
export const updateGoogleCalendarSettings = async (userId, settings) => {
  return handleAsyncOperation(async () => {
    await updateUserGoogleCalendar(userId, settings);

    return { success: true };
  }, "Failed to update Google Calendar settings");
};

/**
 * Get Google Calendar settings for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Google Calendar settings
 */
export const getGoogleCalendarSettings = async (userId) => {
  return handleAsyncOperation(async () => {
    await connectToDatabase();
    const user = await User.findById(userId);

    if (!user?.googleCalendar) {
      return {
        connected: false,
        autoSync: false,
        calendarId: null,
        calendarName: null,
      };
    }

    const googleCalendarData = user.googleCalendar;

    return {
      connected: googleCalendarData.connected || false,
      autoSync: googleCalendarData.autoSync || false,
      calendarId: googleCalendarData.calendarId || null,
      calendarName: googleCalendarData.calendarName || null,
      connectedAt: googleCalendarData.connectedAt,
    };
  }, "Failed to get Google Calendar settings");
};
