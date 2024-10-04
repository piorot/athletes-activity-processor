import { ActivityDataValidationService } from "./validators/activity-data-validation-service";
import { SamplesValidationService } from "./validators/samples-validation-service";
import { SummaryValidationService } from "./validators/summary-validation-service";
import { SampleType } from "./enums/sample-type";
import Summary from "./interfaces/summary";
import Lap from "./interfaces/lap";
import Sample from "./interfaces/sample";
import LapHeartRateSample from "./interfaces/lap-heart-rate-sample";
import { ActivityType } from "./enums/activity-type";
import ValidationService from "./interfaces/validation-service";
import ActivityData from "./interfaces/activity-data";
import { ValidationError } from "./errors/validation-error";

export class DataProcessor {
  private activitySummary!: Summary;
  private laps!: Lap[];
  private samples!: Sample[];
  private lapsValidationService: ValidationService<Lap[]>;
  private summaryValidationService: ValidationService<Summary>;
  private samplesValidationService: ValidationService<Sample[]>;
  private activityDataValidationService: ValidationService<ActivityData>;

  constructor(
    lapsValidationService: ValidationService<Lap[]>,
    summaryValidationService: ValidationService<Summary>,
    samplesValidationService: ValidationService<Sample[]>,
    activityDataValidationService: ValidationService<ActivityData>
  ) {
    this.lapsValidationService = lapsValidationService;
    this.summaryValidationService = summaryValidationService;
    this.samplesValidationService = samplesValidationService;
    this.activityDataValidationService = activityDataValidationService;
  }

  loadActivitySummary(summary: Summary) {
    this.summaryValidationService.validate(summary);
    this.activitySummary = summary;
  }

  loadLaps(laps: Lap[]) {
    this.lapsValidationService.validate(laps);
    this.laps = laps;
  }

  loadSamples(samples: Sample[]) {
    this.samplesValidationService.validate(samples);
    this.samples = samples.filter((sample) => sample["sample-type"] === SampleType.HEART_RATE);
  }

  process() {
    this.ensureDataIsLoaded();
    this.activityDataValidationService.validate({
      laps: this.laps,
      summary: this.activitySummary,
      samples: this.samples,
    });

    const activityOverview = this.generateActivityOverview();
    const lapsData = this.generateLapsData();

    return { activityOverview, lapsData };
  }

  private ensureDataIsLoaded(): void {
    if (!this.activitySummary || !this.laps || !this.samples) {
      throw new ValidationError(
        "Data validation error: Activity summary, laps, and samples must be loaded before processing."
      );
    }
  }

  private extractHeartRateSamplesForLap(lapIndex: number, activityType: ActivityType): LapHeartRateSample[] | any {
    const relevantForActivityTypeOnly = (_sample: Sample, index: number) => {
      return activityType === ActivityType.INDOOR_CYCLING
        ? index === 2 * lapIndex || index === 2 * lapIndex + 1
        : index === lapIndex;
    };

    const splitCSVAndParse = (sample: Sample) => sample.data.split(",").map((reading) => parseInt(reading) || 0);

    return this.samples
      .filter(relevantForActivityTypeOnly)
      .flatMap(splitCSVAndParse)
      .map((heartRate, index) => ({ sampleIndex: index, heartRate }));
  }

  private generateLapsData() {
    return this.laps.map((lap, index) => ({
      startTime: lap.startTimeInSeconds,
      distance: lap.totalDistanceInMeters,
      duration: lap.timerDurationInSeconds,
      heartRateSamples: this.extractHeartRateSamplesForLap(index, this.activitySummary.activityType),
    }));
  }

  private generateActivityOverview() {
    return {
      userId: this.activitySummary.userId,
      type: this.activitySummary.activityType,
      device: this.activitySummary.deviceName,
      maxHeartRate: this.activitySummary.maxHeartRateInBeatsPerMinute,
      duration: this.activitySummary.durationInSeconds,
    };
  }
}
