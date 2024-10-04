import { SummaryValidationService } from "./summary-validation-service";
import { ValidationError } from "../errors/validation-error"; 
import Summary from "../interfaces/summary";
import { ActivityType } from "../enums/activity-type";

describe("SummaryValidationService", () => {
  let summaryValidationService: SummaryValidationService;

  beforeEach(() => {
    summaryValidationService = new SummaryValidationService();
  });

  it("should throw an error when user ID is missing", () => {
    const summary: Summary = {
      userId: "", // invalid case
      activityType: ActivityType.INDOOR_CYCLING,
      deviceName: "Watch",
      maxHeartRateInBeatsPerMinute: 180,
      durationInSeconds: 3600,
    } as Summary;

    expect(() => summaryValidationService.validate(summary)).toThrow(ValidationError);
    expect(() => summaryValidationService.validate(summary)).toThrow("Summary validation error: User ID is required.");
  });

  it("should throw an error when activity type is missing", () => {
    const summary: Summary = {
      userId: "user123",
      activityType: undefined as unknown as ActivityType, // invalid case
      deviceName: "Watch",
      maxHeartRateInBeatsPerMinute: 180,
      durationInSeconds: 3600,
    } as Summary;

    expect(() => summaryValidationService.validate(summary)).toThrow(ValidationError);
    expect(() => summaryValidationService.validate(summary)).toThrow("Summary validation error: Activity type is required.");
  });

  it("should throw an error when device name is missing", () => {
    const summary: Summary = {
      userId: "user123",
      activityType: ActivityType.INDOOR_CYCLING,
      deviceName: "", // invalid case
      maxHeartRateInBeatsPerMinute: 180,
      durationInSeconds: 3600,
    } as Summary;

    expect(() => summaryValidationService.validate(summary)).toThrow(ValidationError);
    expect(() => summaryValidationService.validate(summary)).toThrow("Summary validation error: Device name is required.");
  });

  it("should throw an error for maximum valid heart rate value", () => {
    const summary: Summary = {
      userId: "user123",
      activityType: ActivityType.INDOOR_CYCLING,
      deviceName: "Watch",
      maxHeartRateInBeatsPerMinute: 220, // edge case
      durationInSeconds: 3600,
    } as Summary;

    expect(() => summaryValidationService.validate(summary)).not.toThrow();
  });

  it("should throw an error for negative maxHeartRateInBeatsPerMinute", () => {
    const summary: Summary = {
      userId: "user123",
      activityType: ActivityType.INDOOR_CYCLING,
      deviceName: "Watch",
      maxHeartRateInBeatsPerMinute: -10, // invalid case
      durationInSeconds: 3600,
    } as Summary;

    expect(() => summaryValidationService.validate(summary)).toThrow(ValidationError);
    expect(() => summaryValidationService.validate(summary)).toThrow("Summary validation error: Max heart rate must be a positive number.");
  });

  it("should throw an error for negative durationInSeconds", () => {
    const summary: Summary = {
      userId: "user123",
      activityType: ActivityType.INDOOR_CYCLING,
      deviceName: "Watch",
      maxHeartRateInBeatsPerMinute: 180,
      durationInSeconds: -10, // invalid case
    } as Summary;

    expect(() => summaryValidationService.validate(summary)).toThrow(ValidationError);
    expect(() => summaryValidationService.validate(summary)).toThrow("Summary validation error: Duration must be a positive number.");
  });

  it("should not throw an error for valid summary", () => {
    const summary: Summary = {
      userId: "user123",
      activityType: ActivityType.INDOOR_CYCLING,
      deviceName: "Watch",
      maxHeartRateInBeatsPerMinute: 180,
      durationInSeconds: 3600,
    } as Summary;

    expect(() => summaryValidationService.validate(summary)).not.toThrow();
  });
});
