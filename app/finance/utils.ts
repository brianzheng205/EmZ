import { GridColDef, GridValueFormatter } from "@mui/x-data-grid";
import * as R from "ramda";

import { capitalizeFirstLetter } from "@/utils";

type BudgetItem = {
  amount: number;
  time: "month" | "year";
  isMonthly?: boolean;
};

type CategoryItems = {
  [name: string]: BudgetItem;
};

export type Metadata = {
  numMonths: number;
};

export type Budget = {
  gross: CategoryItems;
  deductions: CategoryItems;
  expenses: CategoryItems;
  savings: CategoryItems;
  metadata?: Metadata;
};

type CombinedBudgetItem = {
  emily: BudgetItem;
  brian: BudgetItem;
};

type CombinedCategoryItems = {
  [name: string]: CombinedBudgetItem;
};

export type CombinedMetadata = {
  emily: Metadata;
  brian: Metadata;
};

type CombinedBudget = {
  gross: CombinedCategoryItems;
  deductions: CombinedCategoryItems;
  expenses: CombinedCategoryItems;
  savings: CombinedCategoryItems;
};

type CombinedBudgetWithMetadata = CombinedBudget & {
  metadata: {
    brian: Metadata;
    emily: Metadata;
  };
};

type BudgetItemRowWithoutDividers = {
  id: string;
  status?: string;
  category?: string;
  name: string;
  isMonthly: boolean;
  monthlyEmAmount: number;
  yearlyEmAmount: number;
  monthlyZAmount: number;
  yearlyZAmount: number;
};

export type BudgetItemRow = Required<Pick<BudgetSumsRow, "category">> &
  Omit<BudgetSumsRow, "category">;

type BudgetSumsRow = BudgetItemRowWithoutDividers & {
  monthlyEmDivider: number;
  yearlyEmDivider: number;
  monthlyZDivider: number;
  yearlyZDivider: number;
};

type Dividers = {
  monthlyGross: number;
  yearlyGross: number;
  monthlyTakeHome: number;
  yearlyTakeHome: number;
};

// TODO create docstrings for all functions

// EXPORTED HELPERS

/**
 * Combines two budgets into one, merging the items in each category
 * to create CombinedBudgetItem, which holds a BudgetItem for each person.
 * Each budget should have the same structure as stored in Firestore.
 */
export const getCombinedBudgets = (
  budget1: Budget,
  budget2: Budget
): CombinedBudgetWithMetadata => {
  const combinedBudget: CombinedBudget = {
    gross: {},
    deductions: {},
    expenses: {},
    savings: {},
  };

  R.forEach((category) => {
    const cat1 = budget1[category];
    const cat2 = budget2[category];
    const itemNames = R.union(R.keys(cat1), R.keys(cat2));

    const combinedItems: CombinedCategoryItems = {};
    R.forEach((item: string) => {
      const item1: BudgetItem = {
        amount: R.pathOr(0, [item, "amount"], cat1),
        time: R.pathOr("month", [item, "time"], cat1),
        isMonthly: R.pathOr(true, [item, "isMonthly"], cat1),
      };
      const item2: BudgetItem = {
        amount: R.pathOr(0, [item, "amount"], cat2),
        time: R.pathOr("month", [item, "time"], cat2),
        isMonthly: R.pathOr(true, [item, "isMonthly"], cat2),
      };
      combinedItems[item] = { emily: item1, brian: item2 };
    }, itemNames);
    combinedBudget[category] = combinedItems;
  }, R.keys(combinedBudget));

  return {
    ...combinedBudget,
    metadata: {
      emily: { ...budget1?.metadata } as Metadata,
      brian: { ...budget2?.metadata } as Metadata,
    },
  };
};

/**
 * Searches for `emilyName` or `brianName` in the header.
 * If found, returns the corresponding name.
 * If neither name is found, returns an empty string.
 */
export const getPersonFromColumnHeader = (
  header: string,
  emilyName: string,
  brianName: string
) => {
  if (header.includes(emilyName)) {
    return emilyName;
  } else if (header.includes(brianName)) {
    return brianName;
  }

  return "";
};

/**
 * Creates a new budget by removing the old path and adding the new path with the given object.
 * If the old path and new path are the same, it simply updates the value at that path.
 *
 * @example
 *
 * const budget = { gross: { item1: { amount: 1, time: "year" }, item2: { amount: 2, time: "year" } }, deductions: {}, expenses: {}, savings: {} };
 *
 * // creating a new budget by setting item1's amount to 3
 * getUpdatedBudget(budget, ["gross", "item1"], ["gross", "item1"], { amount: 3, time: "year" });
 * //=> { gross: { item1: { amount: 3, time: "year" }, item2: { amount: 2, time: "year" } }, ... };
 *
 * // creating a new budget by renaming item1 to item3
 * getUpdatedBudget(budget, ["gross", "item1"], ["gross", "item3"], { amount: 1, time: "year" });
 * //=> { gross: { item1: { amount: 1, time: "year" }, item3: { amount: 2, time: "year" } }, ... };
 */
export const getUpdatedBudget = (
  budget: Budget,
  oldPath: string[],
  newPath: string[],
  object: object
): Budget =>
  oldPath === newPath
    ? R.assocPath(newPath, object, budget)
    : (R.pipe(
        R.dissocPath(oldPath),
        R.assocPath(newPath, object)
      )(budget) as Budget);

/**
 * Returns the time unit for the changed cell based on the header.
 */
export const getChangedCellTime = (header: string) =>
  header.toLowerCase().includes("month") ? "month" : "year";

/**
 * Returns if the row is a sum of sums based on the row status.
 */
export const isSumOfSumRow = (status: string | undefined) =>
  status && status.includes("sumOfSum") ? true : false;

/**
 * Returns if the row is a sum row based on the row status.
 */
export const isSumRow = (status: string | undefined) =>
  status && status.includes("sum") ? true : false;

/**
 * Returns if the row is a data row (row stored in Firebase) based on the row status.
 */
export const isDataRow = (status: string | undefined) =>
  status && status.includes("data") ? true : false;

// INTERNAL HELPERS
/**
 * Returns the amount of the item in the target time unit `targetTime`.
 *
 * When converting from month to year or year to month, it uses the default
 * number of months (12) unless specified.
 *
 * @example
 *
 * const item = { amount: 1200, time: "month", isMonthly: true };
 * const numMonths = 6;
 *
 * convertCurrency(item, "year"); //=> 14400
 * convertCurrency(item, "year", numMonths); //=> 7200
 * convertCurrency(item, "month"); //=> 1200
 */
const convertCurrency = (
  item: BudgetItem,
  targetTime: "month" | "year",
  numMonths: number = 12
) => {
  if (item.time === targetTime) {
    return item.amount;
  } else if (targetTime === "month") {
    return R.propOr(true, "isMonthly", item) ? item.amount / numMonths : 0;
  } else if (targetTime === "year") {
    return item.amount * numMonths;
  }

  return 0;
};
const getProratedSalary = (salary: number, numMonths: number) =>
  salary * (numMonths / 12);

/**
 * Calculates the take-home pay and tax based using the marginal tax
 * rate as the withholding rate.
 *
 * The tax brackets are based on the 2025 federal tax brackets for a single filer
 * with the exception of the 24% bracket, which is replaced with an estimate of
 * the aggregate marginal tax rate for a salary of around $140,000.
 *
 * TODO: use API to get tax rates (including state and local) based on location, year,
 * and filing status.
 */
const getTakeHomeAndTax = (taxableIncome: number) => {
  if (taxableIncome <= 0) {
    return { takeHome: 0, tax: 0 };
  }

  const federalBrackets = [
    { rate: 0.1, cap: 11925 },
    { rate: 0.12, cap: 48475 },
    { rate: 0.22, cap: 103350 },
    { rate: 0.41, cap: 197300 },
    { rate: 0.32, cap: 250525 },
    { rate: 0.35, cap: 626350 },
    { rate: 0.37, cap: Infinity },
  ];

  let marginalRate = 0;

  for (const bracket of federalBrackets) {
    if (taxableIncome <= bracket.cap) {
      marginalRate = bracket.rate;
      break;
    }
  }

  const tax = taxableIncome * marginalRate;
  return { takeHome: taxableIncome - tax, tax };
};

/**
 * Returns if the category is taxable.
 */
const isTaxable = (category: keyof CombinedBudget) =>
  ["expenses", "savings"].includes(category);

const currencyFormatter: GridValueFormatter = (value: number, row) =>
  row.id.includes("label")
    ? ""
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);

const percentFormatter: GridValueFormatter = (value: number, row) =>
  row.id.includes("label")
    ? ""
    : new Intl.NumberFormat("en-US", {
        style: "percent",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);

const getColumnsHeaders = (person: string) =>
  [
    {
      field: `monthly${person}Amount`,
      headerName: `Monthly ${person}`,
      type: "number",
      flex: 2,
      valueFormatter: currencyFormatter,
      editable: true,
    },
    {
      field: `monthly${person}Percent`,
      headerName: "%",
      type: "number",
      flex: 1,
      valueGetter: (_, row) =>
        row[`monthly${person}Divider`]
          ? row[`monthly${person}Amount`] / row[`monthly${person}Divider`]
          : 0,
      valueFormatter: percentFormatter,
    },
    {
      field: `yearly${person}Amount`,
      headerName: `Yearly ${person}`,
      type: "number",
      flex: 2,
      valueFormatter: currencyFormatter,
      editable: true,
    },
    {
      field: `yearly${person}Percent`,
      headerName: "%",
      type: "number",
      flex: 1,
      valueGetter: (_, row) =>
        row[`yearly${person}Divider`]
          ? row[`yearly${person}Amount`] / row[`yearly${person}Divider`]
          : 0,
      valueFormatter: percentFormatter,
    },
  ] as GridColDef[];

// COLUMNS
const PEOPLE = ["Em", "Z"];

export const columns: GridColDef[] = [
  {
    field: "category",
    headerName: "Category",
    type: "string",
    flex: 2,
    valueFormatter: (value: string | undefined, row) =>
      value && isSumRow(row.status) ? capitalizeFirstLetter(value) : "",
  },
  {
    field: "name",
    headerName: "Name",
    type: "string",
    flex: 2,
    editable: true,
  },
  {
    field: "isMonthly",
    headerName: "Monthly?",
    type: "boolean",
    flex: 1,
    editable: true,
  },
  ...R.pipe(R.map(getColumnsHeaders), R.flatten)(PEOPLE),
];

// ROWS

/**
 * Converts a category of the combined budget into a format that can be used by the data grid.
 */
const getCategoryRows = (
  combinedBudget: CombinedBudgetWithMetadata,
  category: keyof CombinedBudget,
  emilyDividers?: Dividers,
  brianDividers?: Dividers
): { itemRows: BudgetItemRow[]; sumsRow: BudgetSumsRow } => {
  const emilyNumMonths = combinedBudget.metadata.emily.numMonths;
  const brianNumMonths = combinedBudget.metadata.brian.numMonths;

  let monthlyEmSum = 0;
  let yearlyEmSum = 0;
  let monthlyZSum = 0;
  let yearlyZSum = 0;

  const rows: BudgetItemRowWithoutDividers[] = [];
  let id = 0;

  R.forEachObjIndexed((item: CombinedBudgetItem, itemName: string) => {
    id += 1;

    let monthlyEm = 0;
    let yearlyEm = 0;
    let monthlyZ = 0;
    let yearlyZ = 0;

    if (category === "gross" && itemName === "Base") {
      const grossEm = getProratedSalary(
        R.pathOr(0, ["Base", "emily", "amount"], combinedBudget.gross),
        emilyNumMonths
      );
      monthlyEm = Math.round(grossEm / emilyNumMonths);
      yearlyEm = grossEm;
      const grossZ = getProratedSalary(
        R.pathOr(0, ["Base", "brian", "amount"], combinedBudget.gross),
        brianNumMonths
      );
      monthlyZ = Math.round(grossZ / brianNumMonths);
      yearlyZ = grossZ;
    } else {
      monthlyEm = convertCurrency(item.emily, "month", emilyNumMonths);
      yearlyEm = convertCurrency(item.emily, "year", emilyNumMonths);
      monthlyZ = convertCurrency(item.brian, "month", brianNumMonths);
      yearlyZ = convertCurrency(item.brian, "year", brianNumMonths);
    }

    monthlyEmSum += monthlyEm;
    yearlyEmSum += yearlyEm;
    monthlyZSum += monthlyZ;
    yearlyZSum += yearlyZ;

    rows.push({
      id: `${category}-${id}`,
      status: "data",
      category,
      name: itemName,
      isMonthly:
        R.pathOr(true, ["emily", "isMonthly"], item) ||
        R.pathOr(true, ["brian", "isMonthly"], item),
      yearlyEmAmount: yearlyEm,
      monthlyEmAmount: monthlyEm,
      yearlyZAmount: yearlyZ,
      monthlyZAmount: monthlyZ,
    });
  }, combinedBudget[category]);

  const monthlyEmDivider = emilyDividers
    ? isTaxable(category)
      ? emilyDividers.monthlyTakeHome
      : emilyDividers.monthlyGross
    : monthlyEmSum;
  const yearlyEmDivider = emilyDividers
    ? isTaxable(category)
      ? emilyDividers.yearlyTakeHome
      : emilyDividers.yearlyGross
    : yearlyEmSum;

  const monthlyZDivider = brianDividers
    ? isTaxable(category)
      ? brianDividers.monthlyTakeHome
      : brianDividers.monthlyGross
    : monthlyZSum;
  const yearlyZDivider = brianDividers
    ? isTaxable(category)
      ? brianDividers.yearlyTakeHome
      : brianDividers.yearlyGross
    : yearlyZSum;

  const sortedRows: BudgetItemRow[] = R.pipe(
    R.map(
      (row: BudgetItemRowWithoutDividers) =>
        ({
          ...row,
          monthlyEmDivider,
          yearlyEmDivider,
          monthlyZDivider,
          yearlyZDivider,
        } as BudgetItemRow)
    ),
    R.sortBy(R.prop("name"))
  )(rows);

  const categorySumRow: BudgetSumsRow = {
    id: `${category}-sum`,
    status: category === "gross" ? "sumOfSum" : "sum",
    category: capitalizeFirstLetter(category),
    name: "Total",
    isMonthly: true,
    monthlyEmAmount: monthlyEmSum,
    yearlyEmAmount: yearlyEmSum,
    monthlyEmDivider,
    yearlyEmDivider,
    monthlyZAmount: monthlyZSum,
    yearlyZAmount: yearlyZSum,
    monthlyZDivider,
    yearlyZDivider,
  };

  return {
    itemRows: sortedRows,
    sumsRow: categorySumRow,
  };
};

/**
 * Returns the take-home and tax total rows, which are calculated based on the gross total row
 * and the deductions.
 */
const getTakeHomeAndTaxTotalRows = (
  grossTotalRow: BudgetSumsRow,
  deductions: CombinedCategoryItems
): { takeHomeRow: BudgetSumsRow; taxRow: BudgetSumsRow } => {
  let yearlyEmTaxable = grossTotalRow.yearlyEmAmount;
  let yearlyZTaxable = grossTotalRow.yearlyZAmount;

  R.forEachObjIndexed((item: CombinedBudgetItem) => {
    yearlyEmTaxable -= convertCurrency(item.emily, "year");
    yearlyZTaxable -= convertCurrency(item.brian, "year");
  }, deductions);

  const { takeHome: yearlyEmTakeHome, tax: yearlyEmTax } =
    getTakeHomeAndTax(yearlyEmTaxable);
  const monthlyEmTakeHome = yearlyEmTakeHome / 12;
  const monthlyEmTax = yearlyEmTax / 12;
  const { takeHome: yearlyZTakeHome, tax: yearlyZTax } =
    getTakeHomeAndTax(yearlyZTaxable);
  const monthlyZTakeHome = yearlyZTakeHome / 12;
  const monthlyZTax = yearlyZTax / 12;

  return {
    takeHomeRow: {
      id: "take-home",
      status: "sumOfSum",
      category: "Take Home",
      name: "Total",
      isMonthly: true,
      monthlyEmAmount: monthlyEmTakeHome,
      yearlyEmAmount: yearlyEmTakeHome,
      monthlyEmDivider: grossTotalRow.monthlyEmDivider,
      yearlyEmDivider: grossTotalRow.yearlyEmDivider,
      monthlyZAmount: monthlyZTakeHome,
      yearlyZAmount: yearlyZTakeHome,
      monthlyZDivider: grossTotalRow.monthlyZDivider,
      yearlyZDivider: grossTotalRow.yearlyZDivider,
    },
    taxRow: {
      id: "tax",
      status: "sum",
      category: "Tax",
      name: "Total",
      isMonthly: true,
      monthlyEmAmount: monthlyEmTax,
      yearlyEmAmount: yearlyEmTax,
      monthlyEmDivider: grossTotalRow.monthlyEmDivider,
      yearlyEmDivider: grossTotalRow.yearlyEmDivider,
      monthlyZAmount: monthlyZTax,
      yearlyZAmount: yearlyZTax,
      monthlyZDivider: grossTotalRow.monthlyZDivider,
      yearlyZDivider: grossTotalRow.yearlyZDivider,
    },
  };
};

/**
 * Returns the remaining savings row, which is calculated by subtracting
 * expenses and other savings from the take-home row.
 */
const getRemainingSavingsRow = (
  takeHomeRow: BudgetSumsRow,
  expensesSums: BudgetSumsRow,
  savingsSums: BudgetSumsRow
): BudgetSumsRow => {
  const monthlyEmSavings =
    takeHomeRow.monthlyEmAmount -
    expensesSums.monthlyEmAmount -
    savingsSums.monthlyEmAmount;
  const yearlyEmSavings =
    takeHomeRow.yearlyEmAmount -
    expensesSums.yearlyEmAmount -
    savingsSums.yearlyEmAmount;
  const monthlyZSavings =
    takeHomeRow.monthlyZAmount -
    expensesSums.monthlyZAmount -
    savingsSums.monthlyZAmount;
  const yearlyZSavings =
    takeHomeRow.yearlyZAmount -
    expensesSums.yearlyZAmount -
    savingsSums.yearlyZAmount;

  return {
    id: "savings",
    category: "savings",
    name: "Remaining",
    isMonthly: true,
    monthlyEmAmount: monthlyEmSavings,
    yearlyEmAmount: yearlyEmSavings,
    monthlyEmDivider: takeHomeRow.monthlyEmAmount,
    yearlyEmDivider: takeHomeRow.yearlyEmAmount,
    monthlyZAmount: monthlyZSavings,
    yearlyZAmount: yearlyZSavings,
    monthlyZDivider: takeHomeRow.monthlyZAmount,
    yearlyZDivider: takeHomeRow.yearlyZAmount,
  };
};

/**
 * Returns the rows for MUI's DataGrid.
 *
 * The rows are calculated based on the combined budget.
 */
export const getRows = (
  combinedBudget: CombinedBudgetWithMetadata
): (BudgetItemRow | BudgetSumsRow)[] => {
  const { itemRows: gross, sumsRow: grossSums } = getCategoryRows(
    combinedBudget,
    "gross"
  );

  const { takeHomeRow, taxRow } = getTakeHomeAndTaxTotalRows(
    grossSums,
    combinedBudget.deductions
  );
  const EmDividers: Dividers = {
    monthlyGross: grossSums.monthlyEmAmount,
    yearlyGross: grossSums.yearlyEmAmount,
    monthlyTakeHome: takeHomeRow.monthlyEmAmount,
    yearlyTakeHome: takeHomeRow.yearlyEmAmount,
  };
  const ZDividers: Dividers = {
    monthlyGross: grossSums.monthlyZAmount,
    yearlyGross: grossSums.yearlyZAmount,
    monthlyTakeHome: takeHomeRow.monthlyZAmount,
    yearlyTakeHome: takeHomeRow.yearlyZAmount,
  };

  const { itemRows: expenses, sumsRow: expensesSums } = getCategoryRows(
    combinedBudget,
    "expenses",
    EmDividers,
    ZDividers
  );
  const { itemRows: savings, sumsRow: savingsSums } = getCategoryRows(
    combinedBudget,
    "savings",
    EmDividers,
    ZDividers
  );
  const remainingSavingsRow = getRemainingSavingsRow(
    takeHomeRow,
    expensesSums,
    savingsSums
  );
  const { itemRows: deductions, sumsRow: deductionsSums } = getCategoryRows(
    combinedBudget,
    "deductions",
    EmDividers,
    ZDividers
  );

  const savingsSumWithRemaining = {
    ...savingsSums,
    monthlyEmAmount:
      savingsSums.monthlyEmAmount + remainingSavingsRow.monthlyEmAmount,
    yearlyEmAmount:
      savingsSums.yearlyEmAmount + remainingSavingsRow.yearlyEmAmount,
    monthlyZAmount:
      savingsSums.monthlyZAmount + remainingSavingsRow.monthlyZAmount,
    yearlyZAmount:
      savingsSums.yearlyZAmount + remainingSavingsRow.yearlyZAmount,
  };

  return [
    ...expenses,
    expensesSums,
    ...savings,
    remainingSavingsRow,
    savingsSumWithRemaining,
    takeHomeRow,
    taxRow,
    ...deductions,
    deductionsSums,
    grossSums,
    ...gross,
  ];
};
