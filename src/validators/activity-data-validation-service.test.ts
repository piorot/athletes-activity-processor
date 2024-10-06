import { ActivityDataValidationService } from "./activity-data-validation-service";
import { ValidationError } from "../errors/validation-error";
import { ActivityType } from "../enums/activity-type";
import ActivityData from "../interfaces/activity-data";

describe("ActivityDataValidationService", () => {
  let validationService: ActivityDataValidationService;

  beforeEach(() => {
    validationService = new ActivityDataValidationService();
  });

  it("should throw an error if there are less than 2 samples per lap for indoor cycling", () => {
    const mockActivityData: ActivityData = {
      laps: [{}, {}], // 2 laps
      summary: {
        activityType: ActivityType.INDOOR_CYCLING,
        userId: "1",
        maxHeartRateInBeatsPerMinute: 180,
        durationInSeconds: 600,
      },
      samples: [{}, {}], // 2 samples, should be at least 4 (2 samples per lap)
    } as ActivityData;

    expect(() => validationService.validate(mockActivityData)).toThrow(ValidationError);
    expect(() => validationService.validate(mockActivityData)).toThrow(
      "There must be at least 2 samples per lap for indoor cycling."
    );
  });

  it("should throw an error if the number of samples is less than the number of laps for non-indoor cycling activities", () => {
    const mockActivityData: ActivityData = {
      laps: [{}, {}, {}], // 3 laps
      summary: {
        activityType: ActivityType.RUNNING,
        userId: "1",
        maxHeartRateInBeatsPerMinute: 180,
        durationInSeconds: 600,
      },
      samples: [{}, {}], // Only 2 samples
    } as ActivityData;

    expect(() => validationService.validate(mockActivityData)).toThrow(ValidationError);
    expect(() => validationService.validate(mockActivityData)).toThrow(
      "The number of samples must be at least as many as the number of laps."
    );
  });
});
