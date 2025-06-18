import { scheduleTasksService } from "@/lib/services/schedulingService";
import {
  validateScheduleRequest,
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
  hasAISchedulingTokens,
  incrementAISchedulingTokens,
  getAISchedulingTokensLeft,
} from "@/lib/functions/freePlanLimits";
import { getUserSubscriptionLevel } from "@/lib/utils/subscription-utils";

export async function POST(request) {
  logRequest("Scheduling");

  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return handleParseError(parseError);
    }

    // Validate request
    const validation = validateScheduleRequest(body);
    if (!validation.isValid) {
      return handleValidationErrors(validation.errors);
    }

    const { userId, forceReschedule } = validation.data;

    logRequest("Scheduling", {
      userId: sanitizeUserId(userId),
      forceReschedule,
    });

    // Check user subscription level
    const subscriptionLevel = await getUserSubscriptionLevel(userId);

    // For free users, check AI scheduling token limits
    let maxTasks = null;
    if (subscriptionLevel === "free") {
      const tokensLeft = await getAISchedulingTokensLeft(userId);

      if (tokensLeft === 0) {
        return createErrorResponse(
          `You have reached your monthly limit of 25 AI task processing operations. Upgrade to Pro for unlimited AI scheduling.`,
          429
        );
      }

      maxTasks = tokensLeft; // Limit AI processing to available tokens
    }

    // Use the scheduling service
    const result = await scheduleTasksService(
      userId,
      forceReschedule,
      maxTasks
    );

    // Only increment tokens for free users after successful AI usage (and only if tasks were actually scheduled)
    if (subscriptionLevel === "free" && result.scheduledTasks > 0) {
      try {
        // Count each task scheduled as 1 token
        await incrementAISchedulingTokens(userId, result.scheduledTasks);
      } catch (error) {
        console.error("Error incrementing AI scheduling tokens:", error);
        // Don't fail the request if token increment fails
      }
    }

    logSuccess("Scheduling", {
      tasksScheduled: result.scheduledTasks || 0,
      wasForceReschedule: forceReschedule,
    });

    return createSuccessResponse(result);
  } catch (error) {
    return handleServiceError(error, "Scheduling");
  }
}

// Helper function to create error responses
function createErrorResponse(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
