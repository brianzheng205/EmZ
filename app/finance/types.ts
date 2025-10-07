export type BudgetItemsNew = {
  type: "Earnings" | "Deductions" | "Expenses" | "Retirement" | "Liquid Assets";
  name: string;
  amount: number;
  amountTimeSpan: "Monthly" | "Yearly"; // if amount occurs every month or every year
  repeatFreq: "Never" | "Monthly"; // add support for "biweekly" later
};

export type BudgetNew = {
  name: string;
  numMonths: number;
  user: string;
  budgetItems: BudgetItemsNew[];
};

// OLD TYPES
export type Time = "month" | "year";

export type BudgetItem = {
  amount: number;
  time: Time;
  isRecurring?: boolean;
};

type CategoryItems = {
  [name: string]: BudgetItem;
};

export type Metadata = {
  name: string;
  numMonths: number;
  user: string;
};

export type Budget = Metadata & {
  categories: {
    gross: CategoryItems;
    deductions: CategoryItems;
    expenses: CategoryItems;
    savings: CategoryItems;
  };
};

export type BudgetWithId = Budget & {
  id: string;
};

export type CombinedBudgetItem = {
  emily: BudgetItem;
  brian: BudgetItem;
};

export type CombinedCategoryItems = {
  [name: string]: CombinedBudgetItem;
};

export type CombinedMetadata = {
  emilyMetadata: Metadata;
  brianMetadata: Metadata;
};

export type CombinedBudget = CombinedMetadata & {
  categories: {
    gross: CombinedCategoryItems;
    deductions: CombinedCategoryItems;
    expenses: CombinedCategoryItems;
    savings: CombinedCategoryItems;
  };
};

export type IdToBudget = {
  [id: string]: Budget;
};

export type Category = keyof CombinedBudget["categories"];

export type BudgetItemRowWithoutDividers = {
  id: string;
  status?: string;
  category?: string;
  name: string;
  isRecurring: boolean;
  monthlyEmAmount: number;
  yearlyEmAmount: number;
  monthlyZAmount: number;
  yearlyZAmount: number;
  yearlySalaryEm?: number;
  yearlySalaryZ?: number;
};

export type BudgetItemRow = Required<Pick<BudgetSumsRow, "category">> &
  Omit<BudgetSumsRow, "category">;

export type BudgetSumsRow = BudgetItemRowWithoutDividers & {
  monthlyEmDivider: number;
  yearlyEmDivider: number;
  monthlyZDivider: number;
  yearlyZDivider: number;
};

export type Dividers = {
  monthlyGross: number;
  yearlyGross: number;
  monthlyTakeHome: number;
  yearlyTakeHome: number;
};

export type TaxBracket = {
  cap: number | "Infinity";
  rate: number;
};

export type TaxBracketFinite = {
  cap: number;
  rate: number;
};
