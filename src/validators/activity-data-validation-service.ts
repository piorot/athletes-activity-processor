import { ActivityType } from "../enums/activity-type";
import { ValidationError } from "../errors/validation-error";
import ActivityData from "../interfaces/activity-data";
import Lap from "../interfaces/lap";
import Sample from "../interfaces/sample";
import Summary from "../interfaces/summary";
import ValidationService from "../interfaces/validation-service";

export class ActivityDataValidationService implements ValidationService<ActivityData> {
  validate({ laps, summary, samples }: ActivityData): void {
    this.validateSampleCount(laps.length, samples.length, summary.activityType);
    this.validateActivityDuration(laps, summary);
    this.validateHeartRateBoundaries(samples, summary);
  }

  private validateSampleCount(lapsCount: number, samplesCount: number, activityType: ActivityType): void {
    if (activityType === ActivityType.INDOOR_CYCLING && samplesCount < 2 * lapsCount) {
      throw new ValidationError("There must be at least 2 samples per lap for indoor cycling.");
    }

    if (activityType !== ActivityType.INDOOR_CYCLING && samplesCount < lapsCount) {
      throw new ValidationError("The number of samples must be at least as many as the number of laps.");
    }
  }

  // Example of other validation methods
  private validateActivityDuration(laps: Lap[], summary: Summary): void {
    // TODO: Implement logic to check if the total duration recorded in the summary is reasonable
  }

  private validateHeartRateBoundaries(samples: Sample[], summary: Summary): void {
    // TODO: Implement logic to check if heart rate data makes sense compared to max heart rate
  }
}
