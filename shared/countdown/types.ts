import { RepeatFrequency } from "../types";

export type FbEvent = {
  date: string; // datestring in ISO format like "2025-09-25" or empty string
  repeatFreq: RepeatFrequency;
  description: string;
};
