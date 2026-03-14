import {
  toLocalDateStr,
  toUSDateStr,
  capitalizeFirstLetter,
} from "../../app/utils";

jest.mock("@firebase", () => ({
  __esModule: true,
  default: {},
}));

describe("toLocalDateStr", () => {
  it("converts a Date object to a YYYY-MM-DD string", () => {
    // Note: Using local time components to avoid timezone issues
    const date = new Date(2024, 5, 10, 12, 0, 0);
    expect(toLocalDateStr(date)).toBe("2024-06-10");
  });

  it("returns an empty string for null input", () => {
    expect(toLocalDateStr(null)).toBe("");
  });
});

describe("toUSDateStr", () => {
  it("converts a YYYY-MM-DD string to a MM/DD/YY string", () => {
    const dateStr = "2024-06-10";
    expect(toUSDateStr(dateStr)).toBe("6/10/24");
  });
});

describe("capitalizeFirstLetter", () => {
  it("capitalizes the first letter of a string", () => {
    const str = "hello";
    expect(capitalizeFirstLetter(str)).toBe("Hello");
  });

  it("returns an empty string for an empty input string", () => {
    expect(capitalizeFirstLetter("")).toBe("");
  });
});
