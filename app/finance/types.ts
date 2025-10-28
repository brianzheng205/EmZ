// BACKEND BUDGET

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

// FRONTEND BUDGET (TRANSFORMED FROM BACKEND)

export type BudgetItem = Pick<
  FbBudgetItem,
  "name" | "amountTimeSpan" | "repeatFreq"
> & {
  type: FbBudgetItem["type"] | "Liquid Assets";
  amountMonthly: number;
  amountYearly: number;
};

// FRONTEND CALCULATED BUDGET

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
