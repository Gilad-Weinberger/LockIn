import { NextResponse } from "next/server";

/**
 * Error handling utilities for API routes
 */

/**
 * Standard error response structure
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {Object} details - Additional error details
 * @returns {NextResponse} JSON error response
 */
export const createErrorResponse = (message, status = 500, details = null) => {
  const errorBody = {
    error: message,
    timestamp: new Date().toISOString(),
  };

  if (details) {
    errorBody.details = details;
  }

  return NextResponse.json(errorBody, { status });
};

/**
 * Handle validation errors
 * @param {Array} errors - Array of validation error messages
 * @returns {NextResponse} JSON error response
 */
export const handleValidationErrors = (errors) => {
  return createErrorResponse("Validation failed", 400, {
    validationErrors: errors,
  });
};

/**
 * Handle service errors with appropriate HTTP status codes
 * @param {Error} error - Service error
 * @param {string} context - Context where error occurred
 * @returns {NextResponse} JSON error response
 */
export const handleServiceError = (error, context = "Service") => {
  console.error(`${context} error:`, error);

  // Map specific error messages to HTTP status codes
  const errorMappings = {
    "No tasks provided": 400,
    "Tasks array is required": 400,
    "User ID is required": 400,
    "AI service not configured": 500,
    "Failed to update database with scheduled times": 500,
    "GEMINI_API_KEY environment variable is required": 500,
  };

  const status = errorMappings[error.message] || 500;
  const message =
    status === 500
      ? `${context} temporarily unavailable: ${error.message}`
      : error.message;

  return createErrorResponse(message, status);
};

/**
 * Handle parsing errors for request bodies
 * @param {Error} parseError - Parsing error
 * @returns {NextResponse} JSON error response
 */
export const handleParseError = (parseError) => {
  console.error("Failed to parse request body:", parseError);
  return createErrorResponse("Invalid request body format", 400);
};

/**
 * Standardized success response
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @returns {NextResponse} JSON success response
 */
export const createSuccessResponse = (data, message = null) => {
  const responseBody = {
    ...data,
    timestamp: new Date().toISOString(),
  };

  if (message) {
    responseBody.message = message;
  }

  return NextResponse.json(responseBody);
};

/**
 * Log request information for debugging
 * @param {string} endpoint - API endpoint name
 * @param {Object} requestData - Request data to log
 */
export const logRequest = (endpoint, requestData = {}) => {
  console.log(`${endpoint} API called`, {
    timestamp: new Date().toISOString(),
    ...requestData,
  });
};

/**
 * Log successful response
 * @param {string} endpoint - API endpoint name
 * @param {Object} responseData - Response data to log
 */
export const logSuccess = (endpoint, responseData = {}) => {
  console.log(`${endpoint} API success`, {
    timestamp: new Date().toISOString(),
    ...responseData,
  });
};
