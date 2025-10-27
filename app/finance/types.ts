export type FbBudgetItem = {
  type: "Earnings" | "Deductions" | "Expenses" | "Retirement";
  name: string;
  amount: number;
  amountTimeSpan: "Monthly" | "Yearly"; // if amount occurs every month or every year
  repeatFreq: "Never" | "Monthly"; // add support for "biweekly" later
};

export type FbBudget = {
  id: string;
  name: string;
  numMonths: number;
  user: string;
  budgetItems: FbBudgetItem[];
};

export type BudgetItem = {
  type: "Earnings" | "Deductions" | "Expenses" | "Retirement" | "Liquid Assets";
  name: string;
  amountMonthly: number;
  amountYearly: number;
  amountTimeSpan: "Monthly" | "Yearly"; // if amount occurs every month or every year
  repeatFreq: "Never" | "Monthly"; // add support for "biweekly" later
};

export type CategoryWithNoItems = {
  name: string;
  sumMonthly: number;
  sumYearly: number;
};

export type CategoryWithItems = CategoryWithNoItems & {
  items: BudgetItem[];
};

export type CalculatedCategories = {
  earnings: CategoryWithItems;
  deductions: CategoryWithItems;
  taxes: CategoryWithNoItems;
  takeHome: CategoryWithNoItems;
  expenses: CategoryWithItems;
  retirement: CategoryWithItems;
  liquidAssets: CategoryWithItems;
};

export type CalculatedBudget = {
  id: string;
  name: string;
  numMonths: number;
  user: string;
  categories: CalculatedCategories;
};

// functions
export type OnActiveBudgetItemChangeFn = (
  budgetId: string,
  oldItem: BudgetItem,
  newItem: FbBudgetItem
) => void;
export type OnActiveItemChangeFn = (
  oldItem: BudgetItem,
  newItem: FbBudgetItem
) => void;
export type OnItemChangeFn = (newItem: FbBudgetItem) => void;
