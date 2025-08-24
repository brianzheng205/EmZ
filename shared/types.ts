export enum RepeatFrequency {
  Never = "Never",
  Daily = "Daily",
  Weekly = "Weekly",
  Biweekly = "Biweekly",
  Monthly = "Monthly",
  Yearly = "Yearly",
}

export type NonNeverRepeatFrequency = Exclude<
  RepeatFrequency,
  RepeatFrequency.Never
>;
