// laps-validation-service.test.ts
import { LapsValidationService } from "./laps-validation-service"; // Adjust the import path
import { ValidationError } from "../errors/validation-error"; // Adjust the import based on your structure
import Lap from "../interfaces/lap";

describe("LapsValidationService", () => {
  let lapsValidationService: LapsValidationService;

  beforeEach(() => {
    lapsValidationService = new LapsValidationService();
  });

  it("should throw an error when no laps are provided", () => {
    expect(() => lapsValidationService.validate([])).toThrow(ValidationError);
    expect(() => lapsValidationService.validate([])).toThrow("Lap validation error: No laps provided.");
  });

  it("should throw an error when a lap has invalid distance", () => {
    const laps: Lap[] = [{ startTimeInSeconds: 0, totalDistanceInMeters: -100, timerDurationInSeconds: 600 }] as Lap[];

    expect(() => lapsValidationService.validate(laps)).toThrow(ValidationError);
    expect(() => lapsValidationService.validate(laps)).toThrow("Lap validation error: Lap 1 has invalid distance.");
  });

  it("should throw an error when a lap has invalid duration", () => {
    const laps: Lap[] = [{ startTimeInSeconds: 0, totalDistanceInMeters: 100, timerDurationInSeconds: -600 }] as Lap[];

    expect(() => lapsValidationService.validate(laps)).toThrow(ValidationError);
    expect(() => lapsValidationService.validate(laps)).toThrow("Lap validation error: Lap 1 has invalid duration.");
  });

  it("should throw an error when a lap has null start time", () => {
    const laps: Lap[] = [{ startTimeInSeconds: null as unknown as number, totalDistanceInMeters: 100, timerDurationInSeconds: 600 }] as Lap[];

    expect(() => lapsValidationService.validate(laps)).toThrow(ValidationError);
    expect(() => lapsValidationService.validate(laps)).toThrow(
      "Lap validation error: Lap 1 has an invalid start time."
    );
  });

  it("should throw an error when a lap has undefined start time", () => {
    const laps: Lap[] = [{ startTimeInSeconds: undefined as any, totalDistanceInMeters: 100, timerDurationInSeconds: 600 }] as Lap[];

    expect(() => lapsValidationService.validate(laps)).toThrow(ValidationError);
    expect(() => lapsValidationService.validate(laps)).toThrow(
      "Lap validation error: Lap 1 has an invalid start time."
    );
  });

  it("should throw an error when a lap has negative start time", () => {
    const laps: Lap[] = [{ startTimeInSeconds: -1, totalDistanceInMeters: 100, timerDurationInSeconds: 600 }] as Lap[];

    expect(() => lapsValidationService.validate(laps)).toThrow(ValidationError);
    expect(() => lapsValidationService.validate(laps)).toThrow(
      "Lap validation error: Lap 1 has an invalid start time."
    );
  });

  it("should not throw an error for valid laps", () => {
    const laps: Lap[] = [
      { startTimeInSeconds: 0, totalDistanceInMeters: 100, timerDurationInSeconds: 600 },
      { startTimeInSeconds: 600, totalDistanceInMeters: 200, timerDurationInSeconds: 700 },
    ] as Lap[];

    expect(() => lapsValidationService.validate(laps)).not.toThrow();
  });
});
