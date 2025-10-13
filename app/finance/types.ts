export type BudgetItem = {
  type: "Earnings" | "Deductions" | "Expenses" | "Retirement";
  name: string;
  amount: number;
  amountTimeSpan: "Monthly" | "Yearly"; // if amount occurs every month or every year
  repeatFreq: "Never" | "Monthly"; // add support for "biweekly" later
};

export type Budget = {
  name: string;
  numMonths: number;
  user: string;
  budgetItems: BudgetItem[];
};

export type IdToBudget = {
  [id: string]: Budget;
};

export type CalculatedBudgetItem = {
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
  items: CalculatedBudgetItem[];
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
