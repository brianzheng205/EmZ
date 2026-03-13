import {
  CalculatedBudget,
  CalculatedCategories,
  FbBudgetWithId,
  Frequency,
  ViewType,
  BudgetItem,
} from "./types";

const TEMP_TAX_RATE = 0.34; // flat tax rate for simplicity. TODO: implement real tax estimates

const TEMP_RSU_TAX_RATE = 0.34; // flat tax rate for post-vesting RSU income
const TEMP_RSU_TAKE_HOME_RATE = 1 - TEMP_RSU_TAX_RATE;

const NUM_MONTHS_IN_YEAR = 12;
const NUM_PAYCHECKS_IN_YEAR = 26;

/**
 * Converts `amount` into `amountMonthly` and `amountYearly` based on `amountTimeSpan`
 * and calculates calculated budget items such as sums of categories, taxes, and take home.
 *
 * @param budgetItems - a budget's items
 */
export const calculateCategories = (
  budget: FbBudgetWithId,
  viewType: ViewType,
): CalculatedBudget => {
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
    category.sumMonthly += convertToMonthlyAmount(
      item,
      viewType,
      budget.numMonths,
    );
    category.sumYearly += convertToYearlyAmount(item, budget.numMonths);
    category.items.push(item);
  });

  const RSU =
    categories.earnings.items.find((i) => i.name === "RSU") ||
    ({
      name: "RSU",
      amount: 0,
      frequency: Frequency.ONE_TIME,
      isDefinedYearly: true,
    } as BudgetItem);

  const rsuAmountMonthly = convertToMonthlyAmount(
    RSU,
    viewType,
    budget.numMonths,
  );
  const rsuAmountYearly = convertToYearlyAmount(RSU, budget.numMonths);

  // earnings
  const totalEarningsMonthly = categories.earnings.sumMonthly;
  const totalEarningsYearly = categories.earnings.sumYearly;

  // taxable RSU
  const taxableRSUMonthly = rsuAmountMonthly;
  const taxableRSUYearly = rsuAmountYearly;

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

  // take home = gross income - deductions - taxes
  categories.takeHome.sumMonthly =
    totalEarningsMonthly -
    categories.deductions.sumMonthly -
    categories.taxes.sumMonthly;
  categories.takeHome.sumYearly =
    totalEarningsYearly -
    categories.deductions.sumYearly -
    categories.taxes.sumYearly;

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

  const postTaxRSUMonthly = rsuAmountMonthly * TEMP_RSU_TAKE_HOME_RATE;
  const postTaxRSUYearly = rsuAmountYearly * TEMP_RSU_TAKE_HOME_RATE;
  const remainingMonthly =
    categories.liquidAssets.sumMonthly - postTaxRSUMonthly;
  const remainingYearly = categories.liquidAssets.sumYearly - postTaxRSUYearly;

  categories.liquidAssets.items.push({
    type: "Liquid Assets",
    name: "Post-Tax RSU",
    amount: postTaxRSUYearly,
    isDefinedYearly: true,
    frequency: Frequency.MONTHLY,
  });
  categories.liquidAssets.items.push({
    type: "Liquid Assets",
    name: "Remaining",
    amount: remainingYearly,
    isDefinedYearly: true,
    frequency: Frequency.MONTHLY,
  });

  return {
    id: budget.id,
    name: budget.name,
    numMonths: budget.numMonths,
    user: budget.user,
    categories,
  };
};

/**
 * Converts a budget item's amount to its yearly equivalent
 */
export const convertToYearlyAmount = (
  item: BudgetItem,
  numMonths: number = NUM_MONTHS_IN_YEAR,
): number => {
  if (item.frequency === Frequency.ONE_TIME) {
    return item.amount;
  }

  if (item.isDefinedYearly) {
    return item.amount;
  } else if (item.frequency === Frequency.MONTHLY) {
    return item.amount * numMonths;
  } else if (item.frequency === Frequency.BIWEEKLY) {
    return item.amount * NUM_PAYCHECKS_IN_YEAR;
  }

  throw new Error("Unsupported yearly conversion");
};

/**
 * Converts a budget item's amount to its monthly equivalent based on the
 * item's frequency and the budget view type
 *
 * `viewType` is used to determine how to convert the item's amount to the
 * monthly equivalent if the item is defined on a yearly basis and has a
 * biweekly frequency
 */
export const convertToMonthlyAmount = (
  item: BudgetItem,
  viewType: ViewType,
  numMonths: number = NUM_MONTHS_IN_YEAR,
): number => {
  if (item.frequency === Frequency.ONE_TIME) {
    return 0;
  } else if (item.isDefinedYearly) {
    switch (viewType) {
      case ViewType.MONTHLY_AVERAGE:
        return item.amount / numMonths;
      case ViewType.TWO_PAYCHECK:
        return item.amount * (2 / NUM_PAYCHECKS_IN_YEAR);
      case ViewType.THREE_PAYCHECK:
        return item.amount * (3 / NUM_PAYCHECKS_IN_YEAR);
    }
  } else {
    switch (item.frequency) {
      case Frequency.MONTHLY:
        return item.amount;
      case Frequency.BIWEEKLY:
        switch (viewType) {
          case ViewType.MONTHLY_AVERAGE:
            return item.amount * (NUM_PAYCHECKS_IN_YEAR / numMonths);
          case ViewType.TWO_PAYCHECK:
            return item.amount * 2;
          case ViewType.THREE_PAYCHECK:
            return item.amount * 3;
        }
    }
  }
};
