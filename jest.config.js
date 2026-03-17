/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    // This mapping is required to resolve the '@firebase' alias in app/utils.ts,
    // even though the functions under test do not use it.
    "^@firebase$": "<rootDir>/firebase/client.ts",
    "^@shared/(.*)$": "<rootDir>/shared/$1",
  },
  verbose: true,
};
