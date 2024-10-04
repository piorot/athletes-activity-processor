import ValidationService from "../interfaces/validation-service";
import Summary from "../interfaces/summary";
import { ValidationError } from "../errors/validation-error";

export class SummaryValidationService implements ValidationService<Summary> {
  private maxHeartRate: number;
  constructor(maxHeartRate: number = 220) {
    this.maxHeartRate = maxHeartRate;
  }
  validate(summary: Summary): void {
    const maxHeartRate = 220;
    if (!summary.userId) {
      throw new ValidationError("Summary validation error: User ID is required.");
    }

    if (!summary.activityType) {
      throw new ValidationError("Summary validation error: Activity type is required.");
    }

    if (!summary.deviceName) {
      throw new ValidationError("Summary validation error: Device name is required.");
    }

    if (summary.maxHeartRateInBeatsPerMinute <= 0) {
      throw new ValidationError("Summary validation error: Max heart rate must be a positive number.");
    }

    if (summary.maxHeartRateInBeatsPerMinute > this.maxHeartRate) {
      throw new ValidationError(`Summary validation error: Max heart rate must be lower than ${this.maxHeartRate}.`);
    }

    if (summary.durationInSeconds <= 0) {
      throw new ValidationError("Summary validation error: Duration must be a positive number.");
    }
  }
}
