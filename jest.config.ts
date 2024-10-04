import type { Config } from "jest";
const config: Config = {
  verbose: true,
  preset: "ts-jest",
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "!src/matchers"],
};

export default config;
