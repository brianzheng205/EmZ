export type FbBudgetItem = {
  type: "Earnings" | "Deductions" | "Expenses" | "Retirement";
  name: string;
  amount: number;
  amountTimeSpan: "Monthly" | "Yearly"; // if amount occurs every month or every year
  repeatFreq: "Never" | "Monthly"; // add support for "biweekly" later
};

export type FbBudget = {
  name: string;
  numMonths: number;
  user: string;
  budgetItems: FbBudgetItem[];
};

export type IdToBudget = {
  [id: string]: FbBudget;
};

export type BudgetItem = {
  type: "Earnings" | "Deductions" | "Expenses" | "Retirement";
  name: string;
  amountMonthly: number;
  amountYearly: number;
  amountTimeSpan: "Monthly" | "Yearly"; // if amount occurs every month or every year
  repeatFreq: "Never" | "Monthly"; // add support for "biweekly" later
};

export type CalculatedCategory = {
  name: string;
  sumMonthly: number;
  sumYearly: number;
};

export type BudgetItemCategory = CalculatedCategory & {
  items: BudgetItem[];
};

export type CalculatedCategories = {
  earnings: BudgetItemCategory;
  deductions: BudgetItemCategory;
  taxes: CalculatedCategory;
  takeHome: CalculatedCategory;
  expenses: BudgetItemCategory;
  retirement: BudgetItemCategory;
  liquidAssets: CalculatedCategory;
};

export type CalculatedBudget = {
  name: string;
  numMonths: number;
  user: string;
  categories: CalculatedCategories;
};
