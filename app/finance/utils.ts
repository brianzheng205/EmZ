import { GridColDef, GridRowsProp, GridValueFormatter } from "@mui/x-data-grid";
import * as R from "ramda";

type BudgetItem = {
  amount: number;
  time: "month" | "year";
  isMonthly?: boolean;
};

type CategoryItems = {
  [name: string]: BudgetItem;
};

export type Budget = {
  gross: CategoryItems;
  deductions: CategoryItems;
  expenses: CategoryItems;
  savings: CategoryItems;
  metadata?: {
    numMonths?: number;
  };
};

type CombinedBudgetItem = {
  person1: BudgetItem;
  person2: BudgetItem;
};

type CombinedCategoryItems = {
  [name: string]: CombinedBudgetItem;
};

type CombinedBudget = {
  gross: CombinedCategoryItems;
  deductions: CombinedCategoryItems;
  expenses: CombinedCategoryItems;
  savings: CombinedCategoryItems;
};

export type BudgetDataRow = Required<Pick<BudgetCalculatedRow, "category">> &
  Omit<BudgetCalculatedRow, "category">;

type BudgetCalculatedRow = {
  id: string;
  status?: string;
  category?: string;
  name: string;
  isMonthly: boolean;
  monthlyEmAmount: number;
  yearlyEmAmount: number;
  monthlyEmDivider: number;
  yearlyEmDivider: number;
  monthlyZAmount: number;
  yearlyZAmount: number;
  monthlyZDivider: number;
  yearlyZDivider: number;
};

type LabelRow = {
  id: string;
  category: string;
  status: "label";
};

// TODO create docstrings for all functions

// EXPORTED HELPERS
export const getCombinedBudgets = (budget1: Budget, budget2: Budget) => {
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
      combinedItems[item] = { person1: item1, person2: item2 };
    }, itemNames);
    combinedBudget[category] = combinedItems;
  }, R.keys(combinedBudget));

  return combinedBudget;
};

export const getPersonFromColumnHeader = (
  header: string,
  person1Name: string,
  person2Name: string
) => {
  if (header.includes(person1Name)) {
    return person1Name;
  } else if (header.includes(person2Name)) {
    return person2Name;
  }

  return "";
};

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

export const getChangedCellTime = (columnHeader: string) =>
  columnHeader.toLowerCase().includes("month") ? "month" : "year";

export const isLabelRow = (status: string | undefined) =>
  status && status.includes("label") ? true : false;

export const isCalculatedRow = (status: string | undefined) =>
  status && status.includes("calculated") ? true : false;

export const isDataRow = (status: string | undefined) =>
  status && status.includes("data") ? true : false;

// INTERNAL HELPERS
const convertCurrency = (
  item: BudgetItem,
  targetTime: string,
  numMonths?: number
) => {
  if (item.time === targetTime) {
    return item.amount;
  } else if (item.time === "month") {
    return R.propOr(true, "isMonthly", item)
      ? item.amount * (numMonths || 12)
      : 0;
  } else if (item.time === "year") {
    return Math.round(item.amount / (numMonths || 12));
  }

  return 0;
};

// TODO use API to get tax rates (including state and local)
// currently using 2025 federal tax brackets (single) + aggregate marginal tax rate for our tax brackets
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

const isTaxable = (category: string) =>
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
    valueFormatter: (value, row) =>
      isLabelRow(row.status) || isCalculatedRow(row.status) ? value : "",
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
    // editable: true,
  },
  ...R.pipe(R.map(getColumnsHeaders), R.flatten)(PEOPLE),
];

// ROWS
// TODO calculate currency column based on text of column rather than index
// TODO divide by 6 or 5 depending on start date

type Dividers = {
  monthlyGross: number;
  yearlyGross: number;
  monthlyTakeHome: number;
  yearlyTakeHome: number;
};

const getDataRowsHelper = (
  combinedBudget: CombinedBudget,
  person1Dividers: Dividers,
  person2Dividers: Dividers
) => {
  let id = 0;

  return R.mapObjIndexed((category, categoryName: string) => {
    const rows: BudgetDataRow[] = [];

    R.forEachObjIndexed((item: CombinedBudgetItem, itemName: string) => {
      id += 1;
      rows.push({
        id: `${categoryName}-${id}`,
        status: "data",
        category: categoryName,
        name: itemName,
        isMonthly:
          R.pathOr(true, ["person1", "isMonthly"], item) ||
          R.pathOr(true, ["person2", "isMonthly"], item),
        yearlyEmAmount: convertCurrency(item.person1, "year"),
        monthlyEmAmount: convertCurrency(item.person1, "month"),
        yearlyEmDivider: isTaxable(categoryName)
          ? person1Dividers.yearlyTakeHome
          : person1Dividers.yearlyGross,
        monthlyEmDivider: isTaxable(categoryName)
          ? person1Dividers.monthlyTakeHome
          : person1Dividers.monthlyGross,
        yearlyZAmount: convertCurrency(item.person2, "year"),
        monthlyZAmount: convertCurrency(item.person2, "month"),
        yearlyZDivider: isTaxable(categoryName)
          ? person2Dividers.yearlyTakeHome
          : person2Dividers.yearlyGross,
        monthlyZDivider: isTaxable(categoryName)
          ? person2Dividers.monthlyTakeHome
          : person2Dividers.monthlyGross,
      });
    }, category);

    return rows;
  }, combinedBudget);
};

const getGrossTotalRow = (
  grossCategory: CombinedCategoryItems
): BudgetCalculatedRow => {
  let person1Monthly = 0;
  let person1Yearly = 0;
  let person2Monthly = 0;
  let person2Yearly = 0;

  R.forEachObjIndexed((item) => {
    person1Monthly += R.propOr(true, "isMonthly", item)
      ? convertCurrency(item["person1"], "month")
      : 0;
    person1Yearly += convertCurrency(item["person1"], "year");
    person2Monthly += R.propOr(true, "isMonthly", item)
      ? convertCurrency(item["person2"], "month")
      : 0;
    person2Yearly += convertCurrency(item["person2"], "year");
  }, grossCategory);

  return {
    id: "gross-total",
    status: "calculated",
    name: "Gross Total",
    isMonthly: true,
    monthlyEmAmount: person1Monthly,
    yearlyEmAmount: person1Yearly,
    monthlyEmDivider: person1Monthly,
    yearlyEmDivider: person1Yearly,
    monthlyZAmount: person2Monthly,
    yearlyZAmount: person2Yearly,
    monthlyZDivider: person2Monthly,
    yearlyZDivider: person2Yearly,
  };
};

const getTakeHomeAndTaxRows = (
  grossTotalRow: BudgetCalculatedRow,
  deductions: CombinedCategoryItems
): [BudgetCalculatedRow, BudgetCalculatedRow] => {
  let monthlyEmTaxable = grossTotalRow.monthlyEmAmount;
  let yearlyEmTaxable = grossTotalRow.yearlyEmAmount;
  let monthlyZTaxable = grossTotalRow.monthlyZAmount;
  let yearlyZTaxable = grossTotalRow.yearlyZAmount;

  R.forEachObjIndexed((item: CombinedBudgetItem) => {
    monthlyEmTaxable -= convertCurrency(item.person1, "month");
    yearlyEmTaxable -= convertCurrency(item.person1, "year");
    monthlyZTaxable -= convertCurrency(item.person2, "month");
    yearlyZTaxable -= convertCurrency(item.person2, "year");
  }, deductions);

  const { takeHome: monthlyEmTakeHome, tax: monthlyEmTax } =
    getTakeHomeAndTax(monthlyEmTaxable);
  const { takeHome: yearlyEmTakeHome, tax: yearlyEmTax } =
    getTakeHomeAndTax(yearlyEmTaxable);
  const { takeHome: monthlyZTakeHome, tax: monthlyZTax } =
    getTakeHomeAndTax(monthlyZTaxable);
  const { takeHome: yearlyZTakeHome, tax: yearlyZTax } =
    getTakeHomeAndTax(yearlyZTaxable);

  // TODO fix tax bug with deductions (should use taxable income after deductions)
  return [
    {
      id: "take-home",
      status: "calculated",
      category: "Take Home",
      name: "Take Home Total",
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
    {
      id: "tax",
      status: "calculated",
      category: "Tax",
      name: "Tax",
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
  ];
};

const getSavingsRow = (
  takeHomeRow: BudgetCalculatedRow,
  expenses: CombinedCategoryItems,
  savings: CombinedCategoryItems
): BudgetCalculatedRow => {
  let monthlyEmSavings = takeHomeRow.monthlyEmAmount;
  let yearlyEmSavings = takeHomeRow.yearlyEmAmount;
  let monthlyZSavings = takeHomeRow.monthlyZAmount;
  let yearlyZSavings = takeHomeRow.yearlyZAmount;

  R.forEachObjIndexed((item: CombinedBudgetItem) => {
    monthlyEmSavings -= convertCurrency(item.person1, "month");
    yearlyEmSavings -= convertCurrency(item.person1, "year");
    monthlyZSavings -= convertCurrency(item.person2, "month");
    yearlyZSavings -= convertCurrency(item.person2, "year");
  }, expenses);

  R.forEachObjIndexed((item: CombinedBudgetItem) => {
    monthlyEmSavings -= convertCurrency(item.person1, "month");
    yearlyEmSavings -= convertCurrency(item.person1, "year");
    monthlyZSavings -= convertCurrency(item.person2, "month");
    yearlyZSavings -= convertCurrency(item.person2, "year");
  }, savings);

  return {
    id: "savings",
    status: "calculated",
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

const getLabelRow = (category: string): LabelRow => ({
  id: `${category}-label`,
  category,
  status: "label",
});

export const getDataRows = (combinedBudget: CombinedBudget): GridRowsProp => {
  const grossTotalRow = getGrossTotalRow(combinedBudget.gross);
  const [takeHomeRow, taxRow] = getTakeHomeAndTaxRows(
    grossTotalRow,
    combinedBudget.deductions
  );
  const savingsRow = getSavingsRow(
    takeHomeRow,
    combinedBudget.expenses,
    combinedBudget.savings
  );
  const EmDividers: Dividers = {
    monthlyGross: grossTotalRow.monthlyEmAmount,
    yearlyGross: grossTotalRow.yearlyEmAmount,
    monthlyTakeHome: takeHomeRow.monthlyEmAmount,
    yearlyTakeHome: takeHomeRow.yearlyEmAmount,
  };
  const ZDividers: Dividers = {
    monthlyGross: grossTotalRow.monthlyZAmount,
    yearlyGross: grossTotalRow.yearlyZAmount,
    monthlyTakeHome: takeHomeRow.monthlyZAmount,
    yearlyTakeHome: takeHomeRow.yearlyZAmount,
  };

  const processedRows = getDataRowsHelper(
    combinedBudget,
    EmDividers,
    ZDividers
  );

  return [
    getLabelRow("Savings"),
    ...processedRows.savings,
    savingsRow,
    getLabelRow("Expenses"),
    ...processedRows.expenses,
    takeHomeRow,
    taxRow,
    getLabelRow("Deductions"),
    ...processedRows.deductions,
    getLabelRow("Gross"),
    ...processedRows.gross,
    grossTotalRow,
  ];
};
