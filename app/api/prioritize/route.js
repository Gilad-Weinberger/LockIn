import { prioritizeTasksService } from "@/lib/services/prioritizationService";
import {
  validatePrioritizeRequest,
  sanitizeUserId,
} from "@/lib/utils/validation";
import {
  handleValidationErrors,
  handleServiceError,
  handleParseError,
  createSuccessResponse,
  logRequest,
  logSuccess,
} from "@/lib/utils/errorHandling";
import {
  hasAIPrioritizationTokens,
  incrementAIPrioritizationTokens,
  getAIPrioritizationTokensLeft,
  hasEnoughAIPrioritizationTokens,
} from "@/lib/plans/freePlanFeatures";
import { getUserSubscriptionLevel } from "@/lib/utils/subscription-utils";

export async function POST(request) {
  logRequest("Prioritize");

  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return handleParseError(parseError);
    }

    // Validate request
    const validation = validatePrioritizeRequest(body);
    if (!validation.isValid) {
      return handleValidationErrors(validation.errors);
    }

    const { tasks, userId } = validation.data;

    logRequest("Prioritize", {
      tasksCount: tasks.length,
      userId: sanitizeUserId(userId),
    });

    // Check user subscription level
    const subscriptionLevel = await getUserSubscriptionLevel(userId);

    // For free users, check AI prioritization token limits and limit tasks if necessary
    let tasksToProcess = tasks;
    let limitMessage = "";

    if (subscriptionLevel === "free") {
      const tokensLeft = await getAIPrioritizationTokensLeft(userId);

      if (tokensLeft === 0) {
        return createErrorResponse(
          `You have reached your monthly limit of 25 AI task processing operations. Upgrade to Pro for unlimited AI prioritizations.`,
          429
        );
      }

      if (tasks.length > tokensLeft) {
        // Limit tasks to available tokens
        tasksToProcess = tasks.slice(0, tokensLeft);
        limitMessage = ` Note: Only ${tokensLeft} of ${tasks.length} tasks were processed due to your free plan limit.`;

        console.log(
          `Limited tasks for free user: ${tasks.length} -> ${tasksToProcess.length} (${tokensLeft} tokens available)`
        );
      }
    }

    // Use the prioritization service
    const result = await prioritizeTasksService(tasksToProcess, userId);

    // Only increment tokens for free users after successful AI usage
    if (subscriptionLevel === "free") {
      try {
        // Count each task processed as 1 token
        await incrementAIPrioritizationTokens(userId, tasksToProcess.length);
      } catch (error) {
        console.error("Error incrementing AI prioritization tokens:", error);
        // Don't fail the request if token increment fails
      }
    }

    logSuccess("Prioritize", {
      tasksProcessed: tasksToProcess.length,
      quadrantsPopulated: Object.keys(result).filter(
        (key) =>
          key !== "reasoning" &&
          Array.isArray(result[key]) &&
          result[key].length > 0
      ).length,
    });

    // Add limit message to the response if tasks were limited
    if (limitMessage) {
      result.limitMessage = limitMessage;
      result.originalTaskCount = tasks.length;
      result.processedTaskCount = tasksToProcess.length;
    }

    return createSuccessResponse(result);
  } catch (error) {
    return handleServiceError(error, "Prioritization");
  }
}

// Helper function to create error responses
function createErrorResponse(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
