import { SampleType } from "./enums/SampleType";
import Summary from "./interfaces/summary";
import Lap from "./interfaces/lap";
import Sample from "./interfaces/sample";
import LapHeartRateSample from "./interfaces/lapHeartRateSample";
import { ActivityType } from "./enums/ActivityType";

export class DataProcessor {
  private activitySummary!: Summary;
  private laps: Lap[] = [];
  private samples: Sample[] = [];

  loadActivitySummary(data: Summary) {
    this.activitySummary = data;
  }

  loadLaps(laps: Lap[]) {
    this.laps = laps;
  }

  loadSamples(samples: Sample[]) {
    this.samples = samples;
  }

  private extractHeartRateSamplesForLap(lapIndex: number, activityType: ActivityType): LapHeartRateSample[] | any {
    const relevantForActivityTypeOnly = (_sample: Sample, index: number) => {
      return activityType === ActivityType.INDOOR_CYCLING
        ? index === 2 * lapIndex || index === 2 * lapIndex + 1
        : index === lapIndex;
    };

    const heartRateOnly = (sample: Sample) => sample["sample-type"] === SampleType.HEART_RATE;

    const splitCSVAndParse = (sample: Sample) => sample.data.split(",").map((reading) => parseInt(reading) || 0);

    return this.samples
      .filter(heartRateOnly)
      .filter(relevantForActivityTypeOnly)
      .flatMap(splitCSVAndParse)
      .map((heartRate, index) => ({ sampleIndex: index, heartRate }));
  }

  process() {
    const activityOverview = {
      userId: this.activitySummary.userId,
      type: this.activitySummary.activityType,
      device: this.activitySummary.deviceName,
      maxHeartRate: this.activitySummary.maxHeartRateInBeatsPerMinute,
      duration: this.activitySummary.durationInSeconds,
    };

    const lapsData = this.laps.map((lap, index) => ({
      startTime: lap.startTimeInSeconds,
      distance: lap.totalDistanceInMeters,
      duration: lap.timerDurationInSeconds,
      heartRateSamples: this.extractHeartRateSamplesForLap(index, this.activitySummary.activityType),
    }));

    return { activityOverview, lapsData };
  }
}
