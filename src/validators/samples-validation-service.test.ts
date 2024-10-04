import { SamplesValidationService } from "./samples-validation-service"; // Adjust the path as necessary
import Sample from "../interfaces/sample";
import { ValidationError } from "../errors/validation-error";
import { SampleType } from "../enums/sample-type";

describe("SamplesValidationService", () => {
  let validationService: SamplesValidationService;

  beforeEach(() => {
    validationService = new SamplesValidationService();
  });

  it("should throw an error if no samples are provided", () => {
    expect(() => validationService.validate([])).toThrow(ValidationError);
    expect(() => validationService.validate([])).toThrow("Sample validation error: No samples provided.");
  });

  it("should throw an error if a heart rate sample has no data", () => {
    const samples: Sample[] = [
      { "recording-rate": 5, "sample-type": SampleType.HEART_RATE, data: "" },
      { "recording-rate": 5, "sample-type": SampleType.TYPE_1, data: "80,90,100" }, // Not a heart rate sample
    ];

    expect(() => validationService.validate(samples)).toThrow(ValidationError);
    expect(() => validationService.validate(samples)).toThrow("Sample validation error: Sample 1 has no data.");
  });

  it("should throw an error if a heart rate sample has invalid numbers", () => {
    const samples: Sample[] = [
      { "recording-rate": 5, "sample-type": SampleType.HEART_RATE, data: "80,90,invalid" },
    ];

    expect(() => validationService.validate(samples)).toThrow(ValidationError);
    expect(() => validationService.validate(samples)).toThrow("Sample validation error: Invalid number 'invalid' in data.");
  });

  it("should not throw an error for valid heart rate samples", () => {
    const samples: Sample[] = [
      { "recording-rate": 5, "sample-type": SampleType.HEART_RATE, data: "80,90,100" },
      { "recording-rate": 5, "sample-type": SampleType.TYPE_1, data: "80,90,100" }, // Not a heart rate sample
    ];

    expect(() => validationService.validate(samples)).not.toThrow();
  });

  it("should ignore non-heart rate samples during validation", () => {
    const samples: Sample[] = [
      { "recording-rate": 5, "sample-type": SampleType.TYPE_1, data: "80,90,100" },
      { "recording-rate": 5, "sample-type": SampleType.TYPE_3, data: "80,90,100" },
    ];

    expect(() => validationService.validate(samples)).not.toThrow();
  });
});
