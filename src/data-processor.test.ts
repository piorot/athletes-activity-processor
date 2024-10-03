import { DataProcessor } from "./data-processor";
import Lap from "./interfaces/lap";
import Sample from "./interfaces/sample";
import Summary from "./interfaces/summary";
import { laps } from "./test-data/laps";
import { samples } from "./test-data/samples";
import { summary } from "./test-data/summary";

import { customMatchers } from "./matchers/heartRateMatchers";
import { ActivityType } from "./enums/ActivityType";
import { SampleType } from "./enums/SampleType";

expect.extend(customMatchers);

describe("DataProcessor output object", () => {
  let dataProcessor: DataProcessor;

  beforeEach(() => {
    dataProcessor = new DataProcessor();
    dataProcessor.loadActivitySummary(summary as Summary);
    dataProcessor.loadLaps(laps);
    dataProcessor.loadSamples(samples as Sample[]);
  });

  it("should have activityOverview in output object", () => {
    const outputData = dataProcessor.process();
    expect(outputData).toHaveProperty("activityOverview");
    expect(outputData.activityOverview).toBeDefined();
  });

  it("should have lapsData in output object", () => {
    const outputData = dataProcessor.process();
    expect(outputData).toHaveProperty("lapsData");
    expect(outputData.lapsData).toBeDefined();
  });
});

describe("Reading Sample data", () => {
  const createSample = (data: string, sampleType = SampleType.HEART_RATE): Sample => ({
    "recording-rate": 5,
    "sample-type": sampleType,
    data,
  });

  it("should properly read csv of heart rates", () => {
    const dataProcessor = new DataProcessor();
    dataProcessor.loadActivitySummary({} as Summary);
    dataProcessor.loadLaps([{}, {}] as Lap[]);
    dataProcessor.loadSamples([createSample("86,87,88"), createSample("96,97,98")]);

    const outputData = dataProcessor.process();

    expect(outputData.lapsData[0].heartRateSamples).toMatchHeartRateSeries(86, 87, 88);
    expect(outputData.lapsData[1].heartRateSamples).toMatchHeartRateSeries(96, 97, 98);
  });

  it("should properly read csv of heart rates for indor cycling", () => {
    const dataProcessor = new DataProcessor();
    dataProcessor.loadActivitySummary({ activityType: ActivityType.INDOOR_CYCLING } as Summary);
    dataProcessor.loadLaps([{}, {}] as Lap[]);
    dataProcessor.loadSamples([
      createSample("86,87,88"),
      createSample("96,97,98"),
      createSample("106,107,108"),
      createSample("116,117,118"),
    ] as Sample[]);

    const outputData = dataProcessor.process();

    expect(outputData.lapsData[0].heartRateSamples).toMatchHeartRateSeries(86, 87, 88, 96, 97, 98);
    expect(outputData.lapsData[1].heartRateSamples).toMatchHeartRateSeries(106, 107, 108, 116, 117, 118);
  });

  it("should ignore samples different than heart rate type", () => {
    const dataProcessor = new DataProcessor();
    dataProcessor.loadActivitySummary({} as Summary);
    dataProcessor.loadLaps([{}, {}] as Lap[]);
    dataProcessor.loadSamples([
      createSample("86,87,88", SampleType.TYPE_0),
      createSample("96,97,98", SampleType.TYPE_1),
      createSample("106,107,108", SampleType.TYPE_3),
      createSample("116,117,118"),
      createSample("126,127,128"),
    ] as Sample[]);

    const outputData = dataProcessor.process();

    expect(outputData.lapsData[0].heartRateSamples).toMatchHeartRateSeries(116, 117, 118);
    expect(outputData.lapsData[1].heartRateSamples).toMatchHeartRateSeries(126, 127, 128);
  });
});
