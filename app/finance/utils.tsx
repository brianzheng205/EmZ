import {
  CalculatedBudget,
  CalculatedCategories,
  FbBudget,
  ItemAmountTimeSpan,
  ItemRepeatFreq,
} from "./types";

const TEMP_TAX_RATE = 0.34; // flat tax rate for simplicity. TODO: implement real tax estimates

const TEMP_RSU_TAX_RATE = 0.24; // flat tax rate for post-vesting RSU income
const TEMP_RSU_TAKE_HOME_RATE = 1 - TEMP_RSU_TAX_RATE;

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
      items: [],
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

  const RSU = categories.earnings.items.find((i) => i.name === "RSU") || {
    amountMonthly: 0,
    amountYearly: 0,
  };

  // earnings
  const totalEarningsMonthly = categories.earnings.sumMonthly;
  const totalEarningsYearly = categories.earnings.sumYearly;

  // taxable RSU
  const taxableRSUMonthly = RSU.amountMonthly;
  const taxableRSUYearly = RSU.amountYearly;

  // taxable income without RSU = (earnings - RSU) - deductions
  const taxableIncomeNoRSUMonthly =
    totalEarningsMonthly - taxableRSUMonthly - categories.deductions.sumMonthly;
  const taxableIncomeNoRSUYearly =
    totalEarningsYearly - taxableRSUYearly - categories.deductions.sumYearly;

  // taxes based on taxable income
  categories.taxes.sumMonthly =
    taxableIncomeNoRSUMonthly * TEMP_TAX_RATE +
    taxableRSUMonthly * TEMP_RSU_TAX_RATE;
  categories.taxes.sumYearly =
    taxableIncomeNoRSUYearly * TEMP_TAX_RATE +
    taxableRSUYearly * TEMP_RSU_TAX_RATE;

  // take home = taxable income - taxes
  categories.takeHome.sumMonthly =
    totalEarningsMonthly - categories.taxes.sumMonthly;
  categories.takeHome.sumYearly =
    totalEarningsYearly - categories.taxes.sumYearly;

  // liquid assets = take home - retirement - expenses
  categories.liquidAssets.sumMonthly =
    categories.takeHome.sumMonthly -
    categories.retirement.sumMonthly -
    categories.expenses.sumMonthly;
  categories.liquidAssets.sumYearly =
    categories.takeHome.sumYearly -
    categories.retirement.sumYearly -
    categories.expenses.sumYearly;

  // split liqiuid assets = post-tax RSU + remaining

  const postTaxRSUMonthly = RSU.amountMonthly * TEMP_RSU_TAKE_HOME_RATE;
  const postTaxRSUYearly = RSU.amountYearly * TEMP_RSU_TAKE_HOME_RATE;
  const remainingMonthly =
    categories.liquidAssets.sumMonthly - postTaxRSUMonthly;
  const remainingYearly = categories.liquidAssets.sumYearly - postTaxRSUYearly;

  categories.liquidAssets.items.push({
    type: "Liquid Assets",
    name: "Post-Tax RSU",
    amountMonthly: postTaxRSUMonthly,
    amountYearly: postTaxRSUYearly,
    amountTimeSpan: ItemAmountTimeSpan.MONTHLY,
    repeatFreq: ItemRepeatFreq.MONTHLY,
  });
  categories.liquidAssets.items.push({
    type: "Liquid Assets",
    name: "Remaining",
    amountMonthly: remainingMonthly,
    amountYearly: remainingYearly,
    amountTimeSpan: ItemAmountTimeSpan.MONTHLY,
    repeatFreq: ItemRepeatFreq.MONTHLY,
  });

  return {
    id: budget.id,
    name: budget.name,
    numMonths: budget.numMonths,
    user: budget.user,
    categories,
  };
};
