import { SampleType } from "../enums/sample-type";

export default interface Sample {
  "recording-rate": number;
  "sample-type": SampleType;
  data: string;
}
