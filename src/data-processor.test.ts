import { SamplesValidationService } from "./validators/samples-validation-service";
import { SummaryValidationService } from "./validators/summary-validation-service";
import { DataProcessor } from "./data-processor";
import Lap from "./interfaces/lap";
import Sample from "./interfaces/sample";
import Summary from "./interfaces/summary";
import { laps } from "./test-data/laps";
import { samples } from "./test-data/samples";
import { summary } from "./test-data/summary";

import { customMatchers } from "./matchers/heart-rate-matcher";
import { ActivityType } from "./enums/activity-type";
import { SampleType } from "./enums/sample-type";
import { LapsValidationService } from "./validators/laps-validation-service";
import { ValidationError } from "./errors/validation-error";
import { ActivityDataValidationService } from "./validators/activity-data-validation-service";

expect.extend(customMatchers);

jest.mock("./validators/laps-validation-service");
jest.mock("./validators/summary-validation-service");
jest.mock("./validators/samples-validation-service");
jest.mock("./validators/activity-data-validation-service");

describe("DataProcessor", () => {
  let dataProcessor: DataProcessor;
  let lapsValidationService: jest.Mocked<LapsValidationService>;
  let summaryValidationService: jest.Mocked<SummaryValidationService>;
  let samplesValidationService: jest.Mocked<SamplesValidationService>;
  let activityDataValidationService: jest.Mocked<ActivityDataValidationService>;

  const createMockServices = () => {
    lapsValidationService = new LapsValidationService() as jest.Mocked<LapsValidationService>;
    lapsValidationService.validate = jest.fn();

    summaryValidationService = new SummaryValidationService() as jest.Mocked<SummaryValidationService>;
    summaryValidationService.validate = jest.fn();

    samplesValidationService = new SamplesValidationService() as jest.Mocked<SamplesValidationService>;
    samplesValidationService.validate = jest.fn();

    activityDataValidationService = new ActivityDataValidationService() as jest.Mocked<ActivityDataValidationService>;
    activityDataValidationService.validate = jest.fn();
  };

  const initializeDataProcessor = () => {
    dataProcessor = new DataProcessor(
      lapsValidationService,
      summaryValidationService,
      samplesValidationService,
      activityDataValidationService
    );
  };

  beforeEach(() => {
    createMockServices();
    initializeDataProcessor();
  });

  describe("load data", () => {
    it("should validate laps when loading", () => {
      dataProcessor.loadLaps(laps as Lap[]);
      expect(lapsValidationService.validate).toHaveBeenCalledWith(laps);
    });

    it("should validate samples when loading", () => {
      dataProcessor.loadSamples(samples as Sample[]);
      expect(samplesValidationService.validate).toHaveBeenCalledWith(samples);
    });

    it("should validate summary when loading", () => {
      dataProcessor.loadActivitySummary(summary as Summary);
      expect(summaryValidationService.validate).toHaveBeenCalledWith(summary);
    });
  });

  describe("process data", () => {
    describe("validation", () => {
      it("should throw when data has not been loaded first", () => {
        expect(() => dataProcessor.process()).toThrow(ValidationError);
        expect(() => dataProcessor.process()).toThrow(
          "Data validation error: Activity summary, laps, and samples must be loaded before processing."
        );
      });

      it("should call data activity validation", () => {
        dataProcessor.loadActivitySummary({} as Summary);
        dataProcessor.loadLaps([] as Lap[]);
        dataProcessor.loadSamples([] as Sample[]);
        dataProcessor.process();
        expect(activityDataValidationService.validate).toHaveBeenCalled();
      });
    });

    describe("generateActivityOverview", () => {
      it("should return correct activity overview data", () => {
        const summary: Summary = {
          userId: "user123",
          activityType: ActivityType.INDOOR_CYCLING,
          deviceName: "Device A",
          maxHeartRateInBeatsPerMinute: 180,
          durationInSeconds: 3600,
        } as Summary;

        dataProcessor.loadActivitySummary(summary);
        dataProcessor.loadLaps([] as Lap[]);
        dataProcessor.loadSamples([] as Sample[]);

        const result = dataProcessor.process().activityOverview;

        expect(result).toEqual({
          userId: "user123",
          type: ActivityType.INDOOR_CYCLING,
          device: "Device A",
          maxHeartRate: 180,
          duration: 3600,
        });
      });
    });

    describe("generateLapsData", () => {
      const createSample = (data: string, sampleType = SampleType.HEART_RATE): Sample => ({
        "recording-rate": 5,
        "sample-type": sampleType,
        data,
      });

      it("should return correctly formatted laps data", () => {
        const lap: Lap = {
          startTimeInSeconds: 1000,
          totalDistanceInMeters: 5000,
          timerDurationInSeconds: 1200,
        } as Lap;

        dataProcessor.loadLaps([lap, lap]);
        dataProcessor.loadActivitySummary({} as Summary);
        dataProcessor.loadSamples([] as Sample[]);

        const result = dataProcessor.process().lapsData;

        expect(result).toEqual([
          {
            startTime: 1000,
            distance: 5000,
            duration: 1200,
            heartRateSamples: expect.any(Array),
          },
          {
            startTime: 1000,
            distance: 5000,
            duration: 1200,
            heartRateSamples: expect.any(Array),
          },
        ]);
      });

      it("should properly read csv of heart rates", () => {
        dataProcessor.loadActivitySummary({} as Summary);
        dataProcessor.loadLaps([{}, {}] as Lap[]);
        dataProcessor.loadSamples([createSample("86,87,88"), createSample("96,97,98")]);

        const outputData = dataProcessor.process();

        expect(outputData.lapsData[0].heartRateSamples).toMatchHeartRateSeries(86, 87, 88);
        expect(outputData.lapsData[1].heartRateSamples).toMatchHeartRateSeries(96, 97, 98);
      });

      it("should properly read csv of heart rates for indoor cycling", () => {
        dataProcessor.loadActivitySummary({ activityType: ActivityType.INDOOR_CYCLING } as Summary);
        dataProcessor.loadLaps([{}, {}] as Lap[]);
        dataProcessor.loadSamples([
          createSample("86,87,88"),
          createSample("96,97,98"),
          createSample("106,107,108"),
          createSample("116,117,118"),
        ]);

        const outputData = dataProcessor.process();

        expect(outputData.lapsData[0].heartRateSamples).toMatchHeartRateSeries(86, 87, 88, 96, 97, 98);
        expect(outputData.lapsData[1].heartRateSamples).toMatchHeartRateSeries(106, 107, 108, 116, 117, 118);
      });

      it("should ignore samples different than heart rate type", () => {
        dataProcessor.loadActivitySummary({} as Summary);
        dataProcessor.loadLaps([{}, {}] as Lap[]);
        dataProcessor.loadSamples([
          createSample("86,87,88", SampleType.TYPE_0),
          createSample("96,97,98", SampleType.TYPE_1),
          createSample("106,107,108", SampleType.TYPE_3),
          createSample("116,117,118"),
          createSample("126,127,128"),
        ]);

        const outputData = dataProcessor.process();

        expect(outputData.lapsData[0].heartRateSamples).toMatchHeartRateSeries(116, 117, 118);
        expect(outputData.lapsData[1].heartRateSamples).toMatchHeartRateSeries(126, 127, 128);
      });
    });
  });
});
