import 'jest';

declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchHeartRateSeries(...expected: number[]): R;
    }
  }
}