/**
 * Rounds user count to display format (e.g., 2,543 -> "2.5k", 1,234,567 -> "1.2M")
 * @param {number} count - The actual user count
 * @returns {string} - Formatted count string
 */
export const formatUserCount = (count) => {
  if (count < 1000) {
    return Math.floor(count / 100) * 100;
  } else if (count < 1000000) {
    // Format as thousands with "k"
    const thousands = count / 1000;
    if (thousands >= 10) {
      // Round to nearest thousand for 10k+
      return `${Math.floor(thousands)}K`;
    } else {
      // Show one decimal place for under 10k
      return `${thousands.toFixed(1).replace(".0", "")}K`;
    }
  } else {
    // Format as millions with "M"
    const millions = count / 1000000;
    if (millions >= 10) {
      // Round to nearest million for 10M+
      return `${Math.floor(millions)}M`;
    } else {
      // Show one decimal place for under 10M
      return `${millions.toFixed(1).replace(".0", "")}M`;
    }
  }
};

/**
 * Extracts numeric value from user count string (e.g., "2,500+" -> 2500)
 * @param {string} countString - The count string from statsData
 * @returns {number} - Numeric value
 */
export const parseUserCount = (countString) => {
  // Remove commas and plus sign, then parse
  const numericString = countString.replace(/[,+]/g, "");
  return parseInt(numericString, 10) || 0;
};
