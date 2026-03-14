import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleNameMapper: {
    // This mapping is required to resolve the '@firebase' alias in app/utils.ts,
    // even though the functions under test do not use it.
    "^@firebase$": "<rootDir>/firebase/client.ts",
    "^@shared/(.*)$": "<rootDir>/shared/$1",
  },
  verbose: true,
};

export default config;
