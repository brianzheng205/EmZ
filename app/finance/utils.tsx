import { FbBudget, CalculatedBudget, CalculatedCategories } from "./types";

/**
 * Converts `amount` into `amountMonthly` and `amountYearly` based on `amountTimeSpan`
 * and calculates calculated budget items such as sums of categories, taxes, and take home.
 *
 * @param budgetItems - a budget's items
 */
export const getCalculatedCategories = (budget: FbBudget): CalculatedBudget => {
  const budgetItems = budget.budgetItems;

  const categories: CalculatedCategories = {
    earnings: { name: "Earnings", sumMonthly: 0, sumYearly: 0, items: [] },
    deductions: { name: "Deductions", sumMonthly: 0, sumYearly: 0, items: [] },
    taxes: { name: "Taxes", sumMonthly: 0, sumYearly: 0 },
    takeHome: { name: "Take Home", sumMonthly: 0, sumYearly: 0 },
    expenses: { name: "Expenses", sumMonthly: 0, sumYearly: 0, items: [] },
    retirement: { name: "Retirement", sumMonthly: 0, sumYearly: 0, items: [] },
    liquidAssets: {
      name: "Liquid Assets",
      sumMonthly: 0,
      sumYearly: 0,
    },
  };

  budgetItems.forEach((item) => {
    const amountMonthly =
      item.repeatFreq === "Never"
        ? 0
        : item.amountTimeSpan === "Monthly"
        ? item.amount
        : item.amount / budget.numMonths;
    const amountYearly =
      item.amountTimeSpan === "Yearly"
        ? item.amount
        : item.amount * budget.numMonths;

    // TODO: change backend field name from "type" to "category"
    // TODO: change backend `type` field to be lowercase for easier handling
    const category =
      categories[
        item.type === "Earnings"
          ? "earnings"
          : item.type === "Deductions"
          ? "deductions"
          : item.type === "Expenses"
          ? "expenses"
          : "retirement"
      ];
    category.sumMonthly += amountMonthly;
    category.sumYearly += amountYearly;
    category.items.push({
      type: item.type,
      name: item.name,
      amountMonthly,
      amountYearly,
      amountTimeSpan: item.amountTimeSpan,
      repeatFreq: item.repeatFreq,
    });
  });

  // taxable income = earnings - deductions
  const taxableIncomeMonthly =
    categories.earnings.sumMonthly - categories.deductions.sumMonthly;
  const taxableIncomeYearly =
    categories.earnings.sumYearly - categories.deductions.sumYearly;

  // taxes based on taxable income
  const TEMP_TAX_RATE = 0.34; // flat tax rate for simplicity. TODO: implement real tax estimates
  categories.taxes.sumMonthly = taxableIncomeMonthly * TEMP_TAX_RATE;
  categories.taxes.sumYearly = taxableIncomeYearly * TEMP_TAX_RATE;

  // take home = taxable income - taxes
  categories.takeHome.sumMonthly =
    taxableIncomeMonthly - categories.taxes.sumMonthly;
  categories.takeHome.sumYearly =
    taxableIncomeYearly - categories.taxes.sumYearly;

  // liquid assets = take home - retirement - expenses
  categories.liquidAssets.sumMonthly =
    categories.takeHome.sumMonthly -
    categories.retirement.sumMonthly -
    categories.expenses.sumMonthly;
  categories.liquidAssets.sumYearly =
    categories.takeHome.sumYearly -
    categories.retirement.sumYearly -
    categories.expenses.sumYearly;

  return {
    name: budget.name,
    numMonths: budget.numMonths,
    user: budget.user,
    categories,
  };
};
