import {
  FbBudgetItem,
  FbBudgetWithId,
  Frequency,
  ItemType,
  ViewType,
} from "../../../app/finance/types";

import { calculateCategories } from "../../../app/finance/utils";

describe("getCalculatedCategories", () => {
  const dummyBudget: FbBudgetWithId = {
    id: "test",
    name: "Test Budget",
    numMonths: 12,
    user: "user",
    budgetItems: [],
  };

  it("should calculate monthly amounts for Frequency.MONTHLY", () => {
    const item: FbBudgetItem = {
      name: "Rent",
      type: ItemType.EXPENSES,
      amount: 1000,
      frequency: Frequency.MONTHLY,
    };
    const budget = { ...dummyBudget, budgetItems: [item] };

    const result = calculateCategories(budget, ViewType.MONTHLY_AVERAGE);
    const expenses = result.categories.expenses;

    expect(expenses.sumMonthly).toBe(1000);
    expect(expenses.sumYearly).toBe(12000);
  });

  it("should calculate BIWEEKLY amounts based on ViewType", () => {
    const item: FbBudgetItem = {
      name: "Paycheck",
      type: ItemType.EARNINGS,
      amount: 2000,
      frequency: Frequency.BIWEEKLY,
    };
    const budget = { ...dummyBudget, budgetItems: [item] };

    // Default / Monthly Average
    let result = calculateCategories(budget, ViewType.MONTHLY_AVERAGE);
    // (2000 * 26) / 12 = 4333.333...
    expect(result.categories.earnings.sumMonthly).toBeCloseTo(4333.33, 2);
    expect(result.categories.earnings.sumYearly).toBe(2000 * 26);

    // Two Paycheck
    result = calculateCategories(budget, ViewType.TWO_PAYCHECK);
    expect(result.categories.earnings.sumMonthly).toBe(4000);

    // Three Paycheck
    result = calculateCategories(budget, ViewType.THREE_PAYCHECK);
    expect(result.categories.earnings.sumMonthly).toBe(6000);
  });

  it("should handle Frequency.ONE_TIME correctly", () => {
    const item: FbBudgetItem = {
      name: "One Time",
      type: ItemType.EARNINGS,
      amount: 500,
      frequency: Frequency.ONE_TIME,
    };
    const budget = { ...dummyBudget, budgetItems: [item] };

    const result = calculateCategories(budget, ViewType.MONTHLY_AVERAGE);

    expect(result.categories.earnings.sumMonthly).toBeCloseTo(500 / 12, 2);
    expect(result.categories.earnings.sumYearly).toBe(500);
  });
});
