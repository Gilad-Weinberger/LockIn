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

    // Use the prioritization service
    const result = await prioritizeTasksService(tasks, userId);

    logSuccess("Prioritize", {
      tasksProcessed: tasks.length,
      quadrantsPopulated: Object.keys(result).filter(
        (key) =>
          key !== "reasoning" &&
          Array.isArray(result[key]) &&
          result[key].length > 0
      ).length,
    });

    return createSuccessResponse(result);
  } catch (error) {
    return handleServiceError(error, "Prioritization");
  }
}
