import ValidationService from '../interfaces/validation-service';
import Lap from '../interfaces/lap';
import { ValidationError } from '../errors/validation-error'; 

export class LapsValidationService implements ValidationService<Lap[]> {
  validate(laps: Lap[]): void {
    if (!laps.length) {
      throw new ValidationError("Lap validation error: No laps provided.");
    }

    laps.forEach((lap, index) => {
      if ((lap.startTimeInSeconds ?? -1) < 0) {
        throw new ValidationError(`Lap validation error: Lap ${index + 1} has an invalid start time.`);
      }
      if (lap.totalDistanceInMeters <= 0) {
        throw new ValidationError(`Lap validation error: Lap ${index + 1} has invalid distance.`);
      }
      if (lap.timerDurationInSeconds <= 0) {
        throw new ValidationError(`Lap validation error: Lap ${index + 1} has invalid duration.`);
      }
    });
  }
}
