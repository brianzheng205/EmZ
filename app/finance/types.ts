// TODO: add support for "biweekly" for paychecks
export enum ItemType {
  EARNINGS = "Earnings",
  DEDUCTIONS = "Deductions",
  EXPENSES = "Expenses",
  RETIREMENT = "Retirement",
}

export enum ItemAmountTimeSpan {
  MONTHLY = "Monthly",
  YEARLY = "Yearly",
}

export enum ItemRepeatFreq {
  NEVER = "Never",
  MONTHLY = "Monthly",
}

// BACKEND BUDGET

export type FbBudgetItem = {
  type: ItemType;
  name: string;
  amount: number;
  amountTimeSpan: ItemAmountTimeSpan; // if amount occurs every month or every year
  repeatFreq: ItemRepeatFreq;
};

export type FbBudgetMetadata = {
  name: string;
  numMonths: number;
  user: string;
};

export type FbBudget = FbBudgetMetadata & {
  budgetItems: FbBudgetItem[];
};

export type FbBudgetWithId = FbBudget & { id: string };

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
