// TODO: add support for "biweekly" for paychecks
export enum ItemType {
  EARNINGS = "Earnings",
  DEDUCTIONS = "Deductions",
  EXPENSES = "Expenses",
  RETIREMENT = "Retirement",
}

export enum Frequency {
  ONE_TIME = "One Time",
  BIWEEKLY = "Biweekly",
  MONTHLY = "Monthly",
}

export enum AmountBasis {
  MONTHLY = "Monthly",
  YEARLY = "Yearly",
}

export enum ViewType {
  MONTHLY_AVERAGE = "Monthly Average",
  TWO_PAYCHECK = "Two Paycheck Month",
  THREE_PAYCHECK = "Three Paycheck Month",
}

// BACKEND BUDGET

export type FbBudgetItem = {
  type: ItemType;
  name: string;
  amount: number;
  frequency: Frequency;
  basis: AmountBasis;
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
  "name" | "frequency" | "basis" | "amount"
> & {
  type: FbBudgetItem["type"] | "Liquid Assets";
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
