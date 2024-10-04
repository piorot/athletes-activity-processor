import ValidationService from "../interfaces/validation-service";
import Sample from "../interfaces/sample";
import { ValidationError } from "../errors/validation-error";
import { ActivityType } from "../enums/activity-type";
import { SampleType } from "../enums/sample-type";

export class SamplesValidationService implements ValidationService<Sample[]> {
  validate(samples: Sample[]): void {
    if (!samples.length) {
      throw new ValidationError("Sample validation error: No samples provided.");
    }

    samples
      .filter((sample) => sample["sample-type"] === SampleType.HEART_RATE)
      .forEach((sample, index) => {
        if (!sample.data) {
          throw new ValidationError(`Sample validation error: Sample ${index + 1} has no data.`);
        }

        const parsedData = sample.data.split(",").map((value) => {
          const parsedValue = parseInt(value, 10);
          if (isNaN(parsedValue)) {
            throw new ValidationError(`Sample validation error: Invalid number '${value}' in data.`);
          }
          return parsedValue;
        });
      });
  }
}
