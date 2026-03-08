import { AmountBasis, Frequency, ViewType } from "../../../app/finance/types";
import { convertBudgetItemAmount } from "../../../app/finance/utils";

describe("Precision Logic Verification (On-Demand Calculation)", () => {
  // Verifying getBudgetItemAmount helper

  test("Case 1: Monthly Basis -> Monthly View", () => {
    // Input: 500 Monthly
    // View: Monthly Average
    // Expect: 500
    const val = convertBudgetItemAmount(
      { amount: 500, basis: AmountBasis.MONTHLY, frequency: Frequency.MONTHLY },
      AmountBasis.MONTHLY,
      ViewType.MONTHLY_AVERAGE,
    );
    expect(val).toBe(500);
  });

  test("Case 2: Monthly Basis -> Yearly View", () => {
    // Input: 500 Monthly
    // View: Monthly Average (irrelevant for Yearly target)
    // Expect: 6000
    const val = convertBudgetItemAmount(
      { amount: 500, basis: AmountBasis.MONTHLY, frequency: Frequency.MONTHLY },
      AmountBasis.YEARLY,
      ViewType.MONTHLY_AVERAGE,
    );
    expect(val).toBe(6000);
  });

  test("Case 3: Yearly Basis -> Yearly View", () => {
    // Input: 60000 Yearly
    // Expect: 60000
    const val = convertBudgetItemAmount(
      {
        amount: 60000,
        basis: AmountBasis.YEARLY,
        frequency: Frequency.ONE_TIME,
      },
      AmountBasis.YEARLY,
      ViewType.MONTHLY_AVERAGE,
    );
    expect(val).toBe(60000);
  });

  test("Case 4: Biweekly Frequency (Yearly Basis) -> Monthly Average View", () => {
    // Input: 52000 Yearly (Biweekly)
    // Expect: 52000 / 12 = 4333.33...
    const val = convertBudgetItemAmount(
      {
        amount: 52000,
        basis: AmountBasis.YEARLY,
        frequency: Frequency.BIWEEKLY,
      },
      AmountBasis.MONTHLY,
      ViewType.MONTHLY_AVERAGE,
    );
    expect(val).toBeCloseTo(4333.3333, 4);
  });

  test("Case 5: Biweekly Frequency (Yearly Basis) -> Two Paycheck View", () => {
    // Input: 52000 Yearly (Biweekly)
    // 52000 / 26 = 2000 per paycheck
    // View: Two Paycheck -> 4000
    const val = convertBudgetItemAmount(
      {
        amount: 52000,
        basis: AmountBasis.YEARLY,
        frequency: Frequency.BIWEEKLY,
      },
      AmountBasis.MONTHLY, // Target is Monthly column
      ViewType.TWO_PAYCHECK,
    );
    expect(val).toBe(4000);
  });

  test("Case 6: One Time Frequency (Yearly Basis) -> Monthly Average View", () => {
    // Input: 1200 Yearly (One Time)
    // Expect: 100
    const val = convertBudgetItemAmount(
      {
        amount: 1200,
        basis: AmountBasis.YEARLY,
        frequency: Frequency.ONE_TIME,
      },
      AmountBasis.MONTHLY,
      ViewType.MONTHLY_AVERAGE,
    );
    expect(val).toBe(100);
  });

  test("Case 7: One Time Frequency (Yearly Basis) -> Two Paycheck View (0)", () => {
    // Input: 1200 Yearly (One Time)
    // Expect: 0 (One time items don't appear in paycheck views typically?)
    // Checking implementation: case Frequency.ONE_TIME -> switch(viewType) ... default: return 0. (Only Monthly_Average returns /12).
    const val = convertBudgetItemAmount(
      {
        amount: 1200,
        basis: AmountBasis.YEARLY,
        frequency: Frequency.ONE_TIME,
      },
      AmountBasis.MONTHLY,
      ViewType.TWO_PAYCHECK,
    );
    expect(val).toBe(0);
  });
});
