import { SampleType } from "../enums/SampleType";

export interface SampleRecord {
  recordingRate: number;
  sampleType: SampleType;
  data: string;
}
