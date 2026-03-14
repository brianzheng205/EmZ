import {
  toDate,
  addDays,
  addWeeks,
  addMonths,
  addYears,
} from "../../shared/utils";

describe("toDate", () => {
  it("converts a YYYY-MM-DD string to a Date object", () => {
    const dateStr = "2024-06-10";
    const date = toDate(dateStr);
    expect(date?.getUTCFullYear()).toBe(2024);
    expect(date?.getUTCMonth()).toBe(5);
    expect(date?.getUTCDate()).toBe(10);
  });

  it("returns null for an empty string", () => {
    expect(toDate("")).toBeNull();
  });
});

describe("addDays", () => {
  it("adds the specified number of days to a date", () => {
    const date = new Date("2024-06-10T00:00:00.000Z");
    const expectedDate = new Date("2024-06-15T00:00:00.000Z");
    expect(addDays(date, 5)).toEqual(expectedDate);
  });
});

describe("addWeeks", () => {
  it("adds the specified number of weeks to a date", () => {
    const date = new Date("2024-06-10T00:00:00.000Z");
    const expectedDate = new Date("2024-06-24T00:00:00.000Z");
    expect(addWeeks(date, 2)).toEqual(expectedDate);
  });
});

describe("addMonths", () => {
  it("adds the specified number of months to a date", () => {
    const date = new Date("2024-06-10T00:00:00.000Z");
    const expectedDate = new Date("2024-09-10T00:00:00.000Z");
    expect(addMonths(date, 3)).toEqual(expectedDate);
  });
});

describe("addYears", () => {
  it("adds the specified number of years to a date", () => {
    const date = new Date("2024-06-10T00:00:00.000Z");
    const expectedDate = new Date("2029-06-10T00:00:00.000Z");
    expect(addYears(date, 5)).toEqual(expectedDate);
  });
});
