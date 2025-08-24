export enum RepeatFrequency {
  Never = "Never",
  Daily = "Daily",
  Weekly = "Weekly",
  Biweekly = "Biweekly",
  Monthly = "Monthly",
  Yearly = "Yearly",
}

export type FbEvent = {
  date: string; // datestring in ISO format like "2025-09-25" or empty string
  repeatFreq: RepeatFrequency;
  description: string;
};
