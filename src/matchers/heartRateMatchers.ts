import LapHeartRateSample from "../interfaces/lapHeartRateSample";

export const customMatchers = {
  toMatchHeartRateSeries(received: Array<LapHeartRateSample>, ...expected: number[]) {
    const pass =
      received.length === expected.length &&
      received.every((item, index) => item.sampleIndex === index && item.heartRate === expected[index]);

    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to match heart rate series ${expected}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to match heart rate series ${expected}`,
        pass: false,
      };
    }
  },
};
