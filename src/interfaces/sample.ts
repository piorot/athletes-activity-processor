import { SampleType } from "../enums/SampleType";

export default interface Sample {
  "recording-rate": number;
  "sample-type": SampleType;
  data: string;
}
