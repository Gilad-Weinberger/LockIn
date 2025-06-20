const freePlanFeatures = [
  "Up to 25 AI-processed tasks per month*",
  "Basic Eisenhower Matrix prioritization",
  "Basic task scheduling",
  "Eisenhower Matrix visualization",
  "Basic calendar view & task organization",
];

import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import { getUserData } from "@/lib/functions/userFunctions";

export const getAIPrioritizationTokensLeft = async (userId) => {
  const userData = await getUserData(userId);
  await checkAndResetTokensIfNeeded(userId, userData);

  const tokensUsed = userData?.aiPrioritizationTokensUsed || 0;
  return Math.max(0, 25 - tokensUsed);
};

export const getAISchedulingTokensLeft = async (userId) => {
  const userData = await getUserData(userId);
  await checkAndResetTokensIfNeeded(userId, userData);

  const tokensUsed = userData?.aiSchedulingTokensUsed || 0;
  return Math.max(0, 25 - tokensUsed);
};

/**
 * Check if user has AI prioritization tokens available
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if user has tokens left
 */
export const hasAIPrioritizationTokens = async (userId) => {
  const tokensLeft = await getAIPrioritizationTokensLeft(userId);
  return tokensLeft > 0;
};

/**
 * Check if user has enough AI prioritization tokens for a specific number of tasks
 * @param {string} userId - User ID
 * @param {number} tasksCount - Number of tasks to process
 * @returns {Promise<boolean>} True if user has enough tokens
 */
export const hasEnoughAIPrioritizationTokens = async (userId, tasksCount) => {
  const tokensLeft = await getAIPrioritizationTokensLeft(userId);
  return tokensLeft >= tasksCount;
};

/**
 * Check if user has AI scheduling tokens available
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if user has tokens left
 */
export const hasAISchedulingTokens = async (userId) => {
  const tokensLeft = await getAISchedulingTokensLeft(userId);
  return tokensLeft > 0;
};

/**
 * Check if user has enough AI scheduling tokens for a specific number of tasks
 * @param {string} userId - User ID
 * @param {number} tasksCount - Number of tasks to process
 * @returns {Promise<boolean>} True if user has enough tokens
 */
export const hasEnoughAISchedulingTokens = async (userId, tasksCount) => {
  const tokensLeft = await getAISchedulingTokensLeft(userId);
  return tokensLeft >= tasksCount;
};

/**
 * Increment AI prioritization token usage
 * @param {string} userId - User ID
 * @param {number} count - Number of tasks processed (defaults to 1)
 * @returns {Promise<void>}
 */
export const incrementAIPrioritizationTokens = async (userId, count = 1) => {
  await connectToDatabase();

  await User.findByIdAndUpdate(userId, {
    $inc: { aiPrioritizationTokensUsed: count },
    updatedAt: new Date(),
  });
};

/**
 * Increment AI scheduling token usage
 * @param {string} userId - User ID
 * @param {number} count - Number of tasks processed (defaults to 1)
 * @returns {Promise<void>}
 */
export const incrementAISchedulingTokens = async (userId, count = 1) => {
  await connectToDatabase();

  await User.findByIdAndUpdate(userId, {
    $inc: { aiSchedulingTokensUsed: count },
    updatedAt: new Date(),
  });
};

/**
 * Check if tokens need to be reset monthly and reset them if needed
 * @param {string} userId - User ID
 * @param {Object} userData - User data object
 * @returns {Promise<void>}
 */
const checkAndResetTokensIfNeeded = async (userId, userData) => {
  if (!userData) return;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Check if lastTokenReset exists and if it's from a different month
  const lastReset = userData.lastTokenReset;
  let shouldReset = false;

  if (!lastReset) {
    // First time user, set reset date
    shouldReset = true;
  } else {
    const lastResetDate = new Date(lastReset);
    const lastResetMonth = lastResetDate.getMonth();
    const lastResetYear = lastResetDate.getFullYear();

    // If current month/year is different from last reset, reset tokens
    if (currentMonth !== lastResetMonth || currentYear !== lastResetYear) {
      shouldReset = true;
    }
  }

  if (shouldReset) {
    await connectToDatabase();

    await User.findByIdAndUpdate(userId, {
      aiPrioritizationTokensUsed: 0,
      aiSchedulingTokensUsed: 0,
      lastTokenReset: now.toISOString(),
      updatedAt: now,
    });

    console.log(
      `Reset AI tokens for user ${userId} for month ${
        currentMonth + 1
      }/${currentYear}`
    );
  }
};

/**
 * Reset all user tokens (admin function)
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const resetUserTokens = async (userId) => {
  await connectToDatabase();
  const now = new Date();

  await User.findByIdAndUpdate(userId, {
    aiPrioritizationTokensUsed: 0,
    aiSchedulingTokensUsed: 0,
    lastTokenReset: now.toISOString(),
    updatedAt: now,
  });
};

export default freePlanFeatures;
