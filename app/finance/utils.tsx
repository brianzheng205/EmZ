import {
  GridColDef,
  GridValueFormatter,
  GridRenderEditCellParams,
  GridEditInputCell,
} from "@mui/x-data-grid";
import * as R from "ramda";

import { capitalizeFirstLetter } from "@/utils";

// TYPES
export type Time = "month" | "year";

type BudgetItem = {
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

type CombinedBudgetItem = {
  emily: BudgetItem;
  brian: BudgetItem;
};

type CombinedCategoryItems = {
  [name: string]: CombinedBudgetItem;
};

export type CombinedMetadata = {
  emilyMetadata: Metadata;
  brianMetadata: Metadata;
};

type CombinedBudget = CombinedMetadata & {
  categories: {
    gross: CombinedCategoryItems;
    deductions: CombinedCategoryItems;
    expenses: CombinedCategoryItems;
    savings: CombinedCategoryItems;
  };
};

export type Category = keyof CombinedBudget["categories"];

type BudgetItemRowWithoutDividers = {
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

type TaxBracket = {
  cap: number | "Infinity";
  rate: number;
};

type TaxBracketFinite = {
  cap: number;
  rate: number;
};

const NUM_MONTHS = 12;

// EXPORTED HELPERS

/**
 * Combines two budgets into one, merging the items in each category
 * to create CombinedBudgetItem, which holds a BudgetItem for each person.
 * Each budget should have the same structure as stored in Firestore.
 */
export const getCombinedBudgets = (
  budget1: Budget,
  budget2: Budget
): CombinedBudget => {
  const combinedBudgetCategories: CombinedBudget["categories"] = {
    gross: {},
    deductions: {},
    expenses: {},
    savings: {},
  };

  R.forEachObjIndexed((_, category) => {
    const cat1 = budget1.categories[category];
    const cat2 = budget2.categories[category];
    const itemNames = R.union(R.keys(cat1), R.keys(cat2));

    const combinedItems: CombinedCategoryItems = {};
    R.forEach((item: string) => {
      const item1: BudgetItem = {
        amount: R.pathOr(0, [item, "amount"], cat1),
        time: R.pathOr("month", [item, "time"], cat1),
        isRecurring: R.pathOr(true, [item, "isRecurring"], cat1),
      };
      const item2: BudgetItem = {
        amount: R.pathOr(0, [item, "amount"], cat2),
        time: R.pathOr("month", [item, "time"], cat2),
        isRecurring: R.pathOr(true, [item, "isRecurring"], cat2),
      };
      combinedItems[item] = { emily: item1, brian: item2 };
    }, itemNames);
    combinedBudgetCategories[category] = combinedItems;
  }, combinedBudgetCategories);

  return {
    categories: combinedBudgetCategories,
    emilyMetadata: R.dissoc("categories", budget1) as Metadata,
    brianMetadata: R.dissoc("categories", budget2) as Metadata,
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
  status && status.includes("item") ? true : false;

// INTERNAL HELPERS

const loadTaxBrackets = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load config: ${res.status}`);
  return await res.json();
};

/**
 * Returns the amount of the item in the target time unit `targetTime`.
 *
 * When converting from month to year or year to month, it uses the default
 * number of months (12) unless specified.
 *
 * @example
 *
 * const item = { amount: 1200, time: "month", isRecurring: true };
 * const numMonths = 6;
 *
 * convertCurrency(item, "year"); //=> 14400
 * convertCurrency(item, "year", numMonths); //=> 7200
 * convertCurrency(item, "month"); //=> 1200
 */
const convertCurrency = (
  item: BudgetItem,
  targetTime: "month" | "year",
  numMonths: number = NUM_MONTHS
) => {
  if (item.time === targetTime) {
    return item.amount;
  } else if (targetTime === "month") {
    return R.propOr(true, "isRecurring", item) ? item.amount / numMonths : 0;
  } else if (targetTime === "year") {
    return item.amount * numMonths;
  }

  return 0;
};

const getProratedSalary = (salary: number, numMonths: number) =>
  salary * (numMonths / NUM_MONTHS);

const getTaxesFromBracket = (taxableIncome: number, brackets: TaxBracket[]) => {
  let tax = 0;
  let prev: TaxBracketFinite = { cap: 0, rate: 0 };

  for (const bracket of brackets) {
    if (bracket.cap === "Infinity") {
      tax += (taxableIncome - prev.cap) * bracket.rate;
      break;
    } else if (taxableIncome > prev.cap) {
      const taxable = Math.min(taxableIncome, bracket.cap) - prev.cap;
      tax += taxable * bracket.rate;
      prev = bracket as TaxBracketFinite;
    } else {
      break;
    }
  }

  return tax;
};

/**
 * Calculates the take-home pay and tax for a given taxable income and
 * state and local tax brackets.
 *
 * It withholds bonuses separately at a flat rate of 22%.
 */
const getMonthlyTakeHomeAndTax = async (
  monthlyTaxableIncome: number,
  stateTaxBrackets: TaxBracket[],
  localTaxBrackets?: TaxBracket[]
) => {
  // Annualize the monthly amounts to get the yearly amounts
  // which assumes you work all 12 months and get the same monthly pay
  const yearlyTaxableIncome = monthlyTaxableIncome * NUM_MONTHS;

  if (yearlyTaxableIncome <= 0) {
    return { takeHome: 0, tax: 0 };
  }

  const federalTaxBrackets = await loadTaxBrackets(
    `/data/${new Date().getFullYear()}/federal.json`
  );

  const tax =
    getTaxesFromBracket(yearlyTaxableIncome, federalTaxBrackets) +
    getTaxesFromBracket(yearlyTaxableIncome, stateTaxBrackets) +
    (localTaxBrackets
      ? getTaxesFromBracket(yearlyTaxableIncome, localTaxBrackets)
      : 0);

  return {
    takeHome: (yearlyTaxableIncome - tax) / NUM_MONTHS,
    tax: tax / NUM_MONTHS,
  };
};

/**
 * Returns if the category is taxable.
 */
const isTaxable = (category: keyof CombinedBudget["categories"]) =>
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

const getColumnsHeaders = (person: string) => {
  const GetCustomEditCell = (targetTime: "month" | "year") => {
    const CustomEditCell = (params: GridRenderEditCellParams) => {
      if (R.isNil(params.row[`yearlySalary${person}`])) {
        return <GridEditInputCell {...params} />;
      }

      const modifiedParams = {
        ...params,
        value: Math.round(
          params.row[`yearlySalary${person}`] /
            (targetTime === "month" ? NUM_MONTHS : 1)
        ),
      };
      return <GridEditInputCell {...modifiedParams} />;
    };

    return CustomEditCell;
  };

  return [
    {
      field: `monthly${person}Amount`,
      headerName: `Monthly ${person}`,
      type: "number",
      flex: 2,
      valueFormatter: currencyFormatter,
      editable: true,
      renderEditCell: GetCustomEditCell("month"),
    },
    {
      field: `monthly${person}Percent`,
      headerName: "%",
      type: "number",
      flex: 1,
      valueGetter: (_, row) =>
        row[`monthly${person}Divider`] !== 0
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
      renderEditCell: GetCustomEditCell("year"),
    },
    {
      field: `yearly${person}Percent`,
      headerName: "%",
      type: "number",
      flex: 1,
      valueGetter: (_, row) =>
        row[`yearly${person}Divider`] !== 0
          ? row[`yearly${person}Amount`] / row[`yearly${person}Divider`]
          : 0,
      valueFormatter: percentFormatter,
    },
  ] as GridColDef[];
};

// COLUMNS
const PEOPLE = ["Em", "Z"];

export const columns: GridColDef[] = R.flatten([
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
    field: "isRecurring",
    headerName: "Recurring?",
    type: "boolean",
    flex: 2,
    editable: true,
  },
  R.map(getColumnsHeaders, PEOPLE),
]) as GridColDef[];

// ROWS

/**
 * Converts a category of the combined budget into a format that can be used by the data grid.
 */
const getCategoryRows = (
  combinedBudget: CombinedBudget,
  category: keyof CombinedBudget["categories"],
  emilyDividers?: Dividers,
  brianDividers?: Dividers
): { itemRows: BudgetItemRow[]; sumsRow: BudgetSumsRow } => {
  const emilyNumMonths = combinedBudget.emilyMetadata.numMonths;
  const brianNumMonths = combinedBudget.brianMetadata.numMonths;

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
    let yearlySalaryEm: number | undefined = undefined;
    let yearlySalaryZ: number | undefined = undefined;

    if (category === "gross" && itemName === "Base") {
      const grossBudget = combinedBudget.categories.gross;
      const grossEm = getProratedSalary(
        R.pathOr(0, ["Base", "emily", "amount"], grossBudget),
        emilyNumMonths
      );
      monthlyEm = Math.round(grossEm / emilyNumMonths);
      yearlyEm = grossEm;
      const grossZ = getProratedSalary(
        R.pathOr(0, ["Base", "brian", "amount"], grossBudget),
        brianNumMonths
      );
      monthlyZ = Math.round(grossZ / brianNumMonths);
      yearlyZ = grossZ;
      yearlySalaryEm = R.pathOr(0, ["Base", "emily", "amount"], grossBudget);
      yearlySalaryZ = R.pathOr(0, ["Base", "brian", "amount"], grossBudget);
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
      status: "item",
      category,
      name: itemName,
      isRecurring:
        R.pathOr(true, ["emily", "isRecurring"], item) ||
        R.pathOr(true, ["brian", "isRecurring"], item),
      yearlyEmAmount: yearlyEm,
      monthlyEmAmount: monthlyEm,
      yearlyZAmount: yearlyZ,
      monthlyZAmount: monthlyZ,
      yearlySalaryEm,
      yearlySalaryZ,
    });
  }, R.path(["categories", category], combinedBudget));

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
    isRecurring: true,
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
const getTakeHomeAndTaxTotalRows = async (
  grossTotalRow: BudgetSumsRow,
  combinedBudget: CombinedBudget
): Promise<{ takeHomeRow: BudgetSumsRow; taxRow: BudgetSumsRow }> => {
  const numMonthsEm = combinedBudget.emilyMetadata.numMonths;
  const numMonthsZ = combinedBudget.brianMetadata.numMonths;

  // Assume that you earn this monthly amount for the whole year even if you don't
  let monthyEmTaxable = grossTotalRow.monthlyEmAmount;
  let monthlyZTaxable = grossTotalRow.monthlyZAmount;

  // Subtract total monthly deductions from monthly gross income
  R.forEachObjIndexed((item: CombinedBudgetItem) => {
    if (R.propOr(true, "isRecurring", item.emily)) {
      monthyEmTaxable -= convertCurrency(item.emily, "month", numMonthsEm);
      monthlyZTaxable -= convertCurrency(item.brian, "month", numMonthsZ);
    }
  }, combinedBudget.categories.deductions);

  // Calculate the yearly bonus amounts for Emily and Brian to add back later
  // (only to yearly take-home) with a standard 22% withholding rate
  const BONUS_WITHHOLDING_RATE = 0.22;
  let bonusEm = 0;
  let bonusZ = 0;

  R.forEachObjIndexed((item: CombinedBudgetItem) => {
    if (!R.propOr(true, "isRecurring", item.emily)) {
      bonusEm += convertCurrency(item.emily, "year");
      bonusZ += convertCurrency(item.brian, "year");
    }
  }, combinedBudget.categories.gross);

  // Calculate monthly FICA tax based on monthly gross income
  const ficaTaxRate = 0.0765;
  const ficaMonthlyEm = ficaTaxRate * grossTotalRow.monthlyEmAmount;
  const ficaMonthlyZ = ficaTaxRate * grossTotalRow.monthlyZAmount;

  // Load in state and local tax brackets
  const emStateTaxBrackets = await loadTaxBrackets(
    `/data/${new Date().getFullYear()}/state/NY.json`
  );
  const emLocalTaxBrackets = await loadTaxBrackets(
    `/data/${new Date().getFullYear()}/local/NY/NYC.json`
  );
  const zStateTaxBrackets = await loadTaxBrackets(
    `/data/${new Date().getFullYear()}/state/VA.json`
  );

  // Calculate monthly taxes
  let { takeHome: monthlyEmTakeHome, tax: monthlyEmTax } =
    await getMonthlyTakeHomeAndTax(
      monthyEmTaxable,
      emStateTaxBrackets,
      emLocalTaxBrackets
    );
  let { takeHome: monthlyZTakeHome, tax: monthlyZTax } =
    await getMonthlyTakeHomeAndTax(monthlyZTaxable, zStateTaxBrackets);

  // Subtract monthly FICA taxes
  monthlyEmTakeHome -= ficaMonthlyEm;
  monthlyEmTax += ficaMonthlyEm;
  monthlyZTakeHome -= ficaMonthlyZ;
  monthlyZTax += ficaMonthlyZ;

  // Add bonus amounts to the yearly take-home and tax amounts
  // Calculates yearly based on the actual number of months worked
  const bonusEmTax = bonusEm * BONUS_WITHHOLDING_RATE;
  const yearlyEmTakeHome =
    monthlyEmTakeHome * numMonthsEm + bonusEm - bonusEmTax;
  const yearlyEmTax = monthlyEmTax * numMonthsEm + bonusEmTax;

  const bonusZTax = bonusZ * BONUS_WITHHOLDING_RATE;
  const yearlyZTakeHome = monthlyZTakeHome * numMonthsZ + bonusZ - bonusZTax;
  const yearlyZTax = monthlyZTax * numMonthsZ + bonusZTax;

  return {
    takeHomeRow: {
      id: "take-home",
      status: "sumOfSum",
      category: "Take Home",
      name: "Total",
      isRecurring: true,
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
      category: "Taxes",
      name: "Total",
      isRecurring: true,
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
    isRecurring: true,
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
export const getRows = async (
  combinedBudget: CombinedBudget
): Promise<(BudgetItemRow | BudgetSumsRow)[]> => {
  const { itemRows: gross, sumsRow: grossSums } = getCategoryRows(
    combinedBudget,
    "gross"
  );

  const { takeHomeRow, taxRow } = await getTakeHomeAndTaxTotalRows(
    grossSums,
    combinedBudget
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

  const { itemRows: savings, sumsRow: savingsSums } = getCategoryRows(
    combinedBudget,
    "savings",
    EmDividers,
    ZDividers
  );
  const { itemRows: expenses, sumsRow: expensesSums } = getCategoryRows(
    combinedBudget,
    "expenses",
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

  const allSavingsRows = [
    remainingSavingsRow,
    ...savings,
    savingsSumWithRemaining,
  ];
  const allExpensesRows = [...expenses, expensesSums];
  const allDeductionsRows = [...deductions, deductionsSums];
  const allGrossRows = [grossSums, ...gross];

  return [
    ...allSavingsRows,
    ...allExpensesRows,
    takeHomeRow,
    taxRow,
    ...allDeductionsRows,
    ...allGrossRows,
  ];
};
