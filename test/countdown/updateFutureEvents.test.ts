import { FbEvent } from "@shared/countdown/types";
import { RepeatFrequency } from "@shared/types";
import { addWeeks } from "@shared/utils";

import { getEventAction } from "../../functions/src/countdown/updateFutureEvents";

describe("getUpdatedEvent", () => {
  const TEST_YESTERDAY_STR = "2024-06-09";
  const TEST_TODAY_STR = "2024-06-10";
  const TEST_TOMORROW_STR = "2024-06-11";

  const TEST_YESTERDAY = new Date(TEST_YESTERDAY_STR);
  const TEST_TODAY = new Date(TEST_TODAY_STR);

  const makeEvent = (date: string, repeatFreq: RepeatFrequency): FbEvent =>
    ({
      date,
      repeatFreq,
      description: "Test Event",
    } as FbEvent);

  it("returns keep if event date is in the future and doesn't repeat", () => {
    const event = makeEvent(TEST_TOMORROW_STR, RepeatFrequency.Never);
    expect(getEventAction(event, TEST_TODAY)).toEqual({ action: "keep" });
  });

  it("returns keep if event date is today and doesn't repeat", () => {
    const event = makeEvent(TEST_TODAY_STR, RepeatFrequency.Never);
    expect(getEventAction(event, TEST_TODAY)).toEqual({ action: "keep" });
  });

  it("returns delete if event date is past and doesn't repeat", () => {
    const event = makeEvent(TEST_YESTERDAY_STR, RepeatFrequency.Never);
    expect(getEventAction(event, TEST_TODAY)).toEqual({ action: "delete" });
  });

  it("returns renew with next date for Daily repeat", () => {
    const event = makeEvent(TEST_YESTERDAY_STR, RepeatFrequency.Daily);
    const result = getEventAction(event, TEST_TODAY);
    expect(result.action).toBe("renew");
    if (result.action === "renew") {
      expect(result.newDate).toBe(TEST_TODAY_STR);
    }
  });

  it("returns renew with next date for Weekly repeat", () => {
    const event = makeEvent(TEST_YESTERDAY_STR, RepeatFrequency.Weekly);
    const result = getEventAction(event, TEST_TODAY);
    expect(result.action).toBe("renew");
    if (result.action === "renew") {
      const nextWeek = addWeeks(TEST_YESTERDAY, 1);
      expect(result.newDate).toBe(nextWeek.toISOString().split("T")[0]);
    }
  });

  it("returns renew with next date for Biweekly repeat", () => {
    const event = makeEvent(TEST_YESTERDAY_STR, RepeatFrequency.Biweekly);
    const result = getEventAction(event, TEST_TODAY);
    expect(result.action).toBe("renew");
    if (result.action === "renew") {
      const nextTwoWeeks = addWeeks(TEST_YESTERDAY, 2);
      expect(result.newDate).toBe(nextTwoWeeks.toISOString().split("T")[0]);
    }
  });

  // it("returns renew with next date for Monthly repeat", () => {
  //   const event = makeEvent(TEST_YESTERDAY_STR, RepeatFrequency.Monthly);
  //   const result = getEventAction(event, TEST_TODAY);
  //   expect(result.action).toBe("renew");
  //   if (result.action === "renew") {
  //     const nextMonth = new Date(TEST_YESTERDAY);
  //     nextMonth.setMonth(nextMonth.getMonth() + 1);
  //     expect(result.newDate).toBe(nextMonth.toISOString().split("T")[0]);
  //   }
  // });

  // it("returns renew with next date (rounded down) for Monthly repeat on 31st", () => {
  //   const event = makeEvent("2024-01-31", RepeatFrequency.Monthly);
  //   const result = getEventAction(event, new Date("2024-02-01"));
  //   expect(result.action).toBe("renew");
  //   if (result.action === "renew") {
  //     // February doesn't have 31 days, so it should go to 29th (2024 is a leap year)
  //     expect(result.newDate).toBe("2024-02-29");
  //   }
  // });

  // it("returns renew with next date for Yearly repeat", () => {
  //   const event = makeEvent(TEST_YESTERDAY_STR, RepeatFrequency.Yearly);
  //   const result = getEventAction(event, TEST_TODAY);
  //   expect(result.action).toBe("renew");
  //   if (result.action === "renew") {
  //     const nextYear = new Date(TEST_YESTERDAY);
  //     nextYear.setFullYear(nextYear.getFullYear() + 1);
  //     expect(result.newDate).toBe(nextYear.toISOString().split("T")[0]);
  //   }
  // });

  it("returns keep if event date is null", () => {
    const event = makeEvent("", RepeatFrequency.Never);
    expect(getEventAction(event, TEST_TODAY)).toEqual({ action: "keep" });
  });
});
