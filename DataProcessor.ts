import { SampleType } from "./enums/SampleType";
import { ActivitySummary } from "./interfaces/ActivitySummary";
import { LapRecord } from "./interfaces/Lap";
import { SampleRecord } from "./interfaces/Sample";

export class DataProcessor {
  private activitySummary: ActivitySummary | null = null;
  private laps: LapRecord[] = [];
  private samples: SampleRecord[] = [];

  loadActivitySummary(data: ActivitySummary) {
    this.activitySummary = data;
  }

  loadLaps(laps: LapRecord[]) {
    this.laps = laps;
  }

  loadSamples(samples: SampleRecord[]) {
    this.samples = samples;
  }

  private extractHeartRateSamples(): { sampleIndex: number; heartRate: number }[] {
    return this.samples
      .filter(sample => sample.sampleType === SampleType.HEART_RATE)
      .flatMap(sample => sample.data.split(',').map((hr, index) => ({
        sampleIndex: index,
        heartRate: parseInt(hr, 10) || 0,
      })));
  }


}
