import {
  GridColDef,
  GridValidRowModel,
  GridRowsProp,
  GridValueFormatter,
} from "@mui/x-data-grid";
import * as R from "ramda";

type BudgetItem = {
  amount: number;
  time: "month" | "year";
};

type BudgetItems = {
  [name: string]: BudgetItem;
};

type CategoryData = {
  isPreTax: boolean;
  items: BudgetItems;
};

export type Budget = {
  [category: string]: CategoryData;
};

type CombinedBudgetItem = {
  person1: BudgetItem;
  person2: BudgetItem;
};

type CombinedBudgetItems = {
  [name: string]: CombinedBudgetItem;
};

type CombinedCategoryData = {
  isPreTax: boolean;
  items: CombinedBudgetItems;
};

type CombinedBudget = {
  [category: string]: CombinedCategoryData;
};

export type BudgetRow = {
  id: string;
  category: string;
  name: string;
  isPreTax: boolean;
} & {
  [key in (typeof COLUMN_HEADERS)[number]]: number;
};

// TODO create docstrings for all functions

// EXPPORTED HELPERS
export const combineBudgets = (budget1: Budget, budget2: Budget) => {
  const allCategories = R.union(R.keys(budget1), R.keys(budget2));
  const combinedBudget: CombinedBudget = {};

  R.forEach((cat: string) => {
    const cat1 = budget1[cat] || { isPreTax: false, items: {} };
    const cat2 = budget2[cat] || { isPreTax: false, items: {} };
    const itemNames = R.union(R.keys(cat1.items), R.keys(cat2.items));

    const combinedItems: CombinedBudgetItems = {};
    R.forEach((itemName: string) => {
      const item1 = cat1.items[itemName] || {
        amount: 0,
        time: "month",
      };
      const item2 = cat2.items[itemName] || {
        amount: 0,
        time: "month",
      };
      combinedItems[itemName] = { person1: item1, person2: item2 };
    }, itemNames);

    combinedBudget[cat] = {
      isPreTax: cat1.isPreTax || cat2.isPreTax,
      items: combinedItems,
    };
  }, allCategories);

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

// INTERNAL HELPERS
const getPersonFromColumn = (column: number) =>
  column < 4 ? "person1" : "person2";

export const getColumnTime = (column: number) =>
  [0, 1, 4, 5].includes(column) ? "month" : "year";

const isPercentColumn = (column: number) => column % 2 === 0;
const isCurrencyColumn = (column: number) => column % 2 === 1;

const convertCurrency = (data: BudgetItem, targetTime: string) => {
  if (!data) return 0;

  if (data.time === targetTime) {
    return data.amount;
  } else if (data.time === "month") {
    return data.amount * 12;
  } else if (data.time === "year") {
    return Math.round(data.amount / 12);
  }

  return 0;
};

const convertColumnHeaderToCurrency = (header: string) =>
  header.replace("%", "$");

const currencyFormatter: GridValueFormatter = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const percentFormatter: GridValueFormatter = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value / 100);

// COLUMNS
export const COLUMN_HEADERS = [
  "Monthly Em (%)",
  "Monthly Em ($)",
  "Yearly Em (%)",
  "Yearly Em ($)",
  "Monthly Z (%)",
  "Monthly Z ($)",
  "Yearly Z (%)",
  "Yearly Z ($)",
];

export const columns: GridColDef[] = [
  {
    field: "category",
    headerName: "Category",
    type: "string",
    flex: 1,
  },
  {
    field: "name",
    headerName: "Name",
    type: "string",
    flex: 1,
    editable: true,
  },
  ...COLUMN_HEADERS.map(
    (header, column) =>
      ({
        field: header,
        headerName: header,
        type: "number",
        flex: 1,
        editable: column % 2 === 1,
        align: "right",
        headerAlign: "right",
        valueFormatter: isCurrencyColumn(column)
          ? currencyFormatter
          : percentFormatter,
      } as GridColDef)
  ),
];

// ROWS
// TODO calculate currency column based on text of column rather than index
// TODO divide by 6 or 5 depending on start date

const getDataRowsHelper = (
  combinedBudget: CombinedBudget,
  dividerRow: GridValidRowModel
): GridRowsProp => {
  const rows: GridValidRowModel[] = [];
  let id = 0;

  R.forEachObjIndexed(
    (category, categoryName: string) =>
      R.forEachObjIndexed((item, itemName) => {
        id += 1;
        rows.push({
          id: `${categoryName}-${id}`,
          category: categoryName,
          name: itemName,
          isPreTax: category.isPreTax,
          ...COLUMN_HEADERS.reduce((acc, columnHeader, column) => {
            const columnTime = getColumnTime(column);
            const person1Amount = R.has("person1", item)
              ? convertCurrency(item.person1, columnTime)
              : 0;
            const person2Amount = R.has("person2", item)
              ? convertCurrency(item.person2, columnTime)
              : 0;
            const divider =
              dividerRow[convertColumnHeaderToCurrency(columnHeader)];
            const person = getPersonFromColumn(column);
            const amount = person === "person1" ? person1Amount : person2Amount;
            acc[columnHeader] = isCurrencyColumn(column)
              ? amount
              : divider > 0
              ? Math.round(amount / divider) * 100
              : 0;
            return acc;
          }, {}),
        });
      }, category.items),
    combinedBudget
  );

  return rows;
};

const getGrossTotalRow = (combinedBudget: CombinedBudget) => {
  const grossTotals = COLUMN_HEADERS.map((_, column) => {
    if (isPercentColumn(column)) {
      return 100;
    }

    const person = getPersonFromColumn(column);
    const columnTime = getColumnTime(column);
    const items: CombinedBudgetItems = R.pathOr(
      {},
      ["Gross", "items"],
      combinedBudget
    );

    let total = 0;

    R.forEachObjIndexed((item) => {
      if (R.has(person, item)) {
        total += convertCurrency(item[person], columnTime);
      }
    }, items);

    return total;
  });

  return {
    id: "gross-total",
    category: "Gross",
    name: "Total",
    status: "locked",
    ...COLUMN_HEADERS.reduce((acc, columnHeader, column) => {
      acc[columnHeader] = grossTotals[column];
      return acc;
    }, {}),
  };
};

const getTakeHomeRow = (
  combinedBudget: CombinedBudget,
  grossTotalRow: GridValidRowModel
): GridValidRowModel => ({
  id: "take-home",
  category: "Take Home",
  name: "Total",
  status: "locked",
  ...COLUMN_HEADERS.reduce((acc, columnHeader, column) => {
    if (isPercentColumn(column)) {
      acc[columnHeader] = 100;
      return acc;
    }

    const person = getPersonFromColumn(column);
    const targetTime = getColumnTime(column);
    const grossTotal = grossTotalRow[columnHeader];
    const nameCategoryPairs = R.toPairs(combinedBudget);
    const deductionCategories = R.filter(
      ([name, category]) => name !== "Gross" && category.isPreTax,
      nameCategoryPairs
    );
    const totalDeductions = R.pipe(
      R.map(([, category]: [string, CombinedCategoryData]) =>
        R.pipe(
          R.prop("items"),
          R.map((item: CombinedBudgetItem) => {
            if (R.has(person, item)) {
              return convertCurrency(item[person], targetTime);
            }
            return 0;
          }),
          R.sum
        )(category)
      ),
      R.sum
    )(deductionCategories);

    acc[columnHeader] = grossTotal - totalDeductions;
    return acc;
  }, {}),
});

const getSavingsRow = (
  combinedBudget: CombinedBudget,
  takeHomeRow: GridValidRowModel
): GridValidRowModel => ({
  id: "savings",
  category: "Savings",
  name: "Savings Account",
  status: "locked",
  ...COLUMN_HEADERS.reduce((acc, columnHeader, column) => {
    const totalTakeHome =
      takeHomeRow[convertColumnHeaderToCurrency(columnHeader)];
    const postTaxCategories = R.filter(
      ([name, category]) => name !== "Gross" && !category.isPreTax,
      R.toPairs(combinedBudget)
    );
    const person = getPersonFromColumn(column);
    const targetTime = getColumnTime(column);
    const postTaxCosts = R.pipe(
      R.map(([, category]: [string, CombinedCategoryData]) =>
        R.pipe(
          R.prop("items"),
          R.map((item: CombinedBudgetItem) =>
            R.has(person, item) ? convertCurrency(item[person], targetTime) : 0
          ),
          R.sum
        )(category)
      ),
      R.sum
    )(postTaxCategories);
    const totalSavings = totalTakeHome - postTaxCosts;

    acc[columnHeader] = isCurrencyColumn(column)
      ? totalSavings
      : totalTakeHome > 0
      ? Math.round(totalSavings / totalTakeHome) * 100
      : 0;

    return acc;
  }, {}),
});

export const getDataRows = (combinedBudget: CombinedBudget): GridRowsProp => {
  const grossTotalRow = getGrossTotalRow(combinedBudget);
  const takeHomeRow = getTakeHomeRow(combinedBudget, grossTotalRow);
  const savingsRow = getSavingsRow(combinedBudget, takeHomeRow);

  const postTaxCategories = R.filter(
    (category) => !category.isPreTax,
    combinedBudget
  );
  const posttaxRows = getDataRowsHelper(postTaxCategories, takeHomeRow);
  const preTaxCategories = R.filter(
    (category) => category.isPreTax,
    combinedBudget
  );
  const pretaxRows = getDataRowsHelper(preTaxCategories, grossTotalRow);

  return [
    ...posttaxRows,
    savingsRow,
    takeHomeRow,
    ...pretaxRows,
    grossTotalRow,
  ];
};
