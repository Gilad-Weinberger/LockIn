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

    // Use the scheduling service
    const result = await scheduleTasksService(userId, forceReschedule);

    logSuccess("Scheduling", {
      tasksScheduled: result.scheduledTasks || 0,
      wasForceReschedule: forceReschedule,
    });

    return createSuccessResponse(result);
  } catch (error) {
    return handleServiceError(error, "Scheduling");
  }
}
