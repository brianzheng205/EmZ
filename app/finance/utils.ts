import {
  GridColDef,
  GridValidRowModel,
  GridRowsProp,
  GridValueFormatter,
} from "@mui/x-data-grid";
import * as R from "ramda";

export type BudgetData = {
  amount: number;
  time: string;
};

type CombinedCategoryData = {
  emily: BudgetData;
  brian: BudgetData;
};

type CombinedCategories = {
  [category: string]: CombinedCategoryData;
};

type SectionData = {
  categories: CombinedCategories;
  isPreTax: boolean;
};

export type Budget = {
  [section: string]: {
    categories: {
      [category: string]: BudgetData;
    };
    isPreTax: boolean;
  };
};

export type CombinedBudget = {
  [section: string]: SectionData;
};

// TODO make calculated cells not editable
// TODO create docstrings for all functions

// HELPERS
const getPersonFromColumn = (column: number) =>
  column < 4 ? "emily" : "brian";

const getColumnTime = (column: number) =>
  [0, 1, 4, 5].includes(column) ? "month" : "year";

const isCurrencyColumn = (column: number) => column % 2 === 1;

const convertCurrency = (data: BudgetData, targetTime: string) => {
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

const convertHeaderToCurrecy = (header: string) => header.replace("%", "$");

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
    field: "section",
    headerName: "Section",
    type: "string",
    flex: 2,
    editable: true,
  },
  {
    field: "category",
    headerName: "Category",
    type: "string",
    flex: 2,
    editable: true,
  },
  ...COLUMN_HEADERS.map(
    (header, column) =>
      ({
        field: header,
        headerName: header,
        type: "number",
        flex: 3,
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
type PreProcessedSection = {
  section: string;
  isPreTax: boolean;
  categories: GridRowsProp;
};

const getGrossTotalRow = (combinedBudget: CombinedBudget) => {
  const grossTotals = COLUMN_HEADERS.map((_, column) => {
    const person = getPersonFromColumn(column);
    return isCurrencyColumn(column)
      ? R.pipe(
          R.pathOr({}, ["Gross", "categories"]),
          R.values,
          R.map((categoryData: CombinedCategoryData) =>
            convertCurrency(categoryData[person], getColumnTime(column))
          ),
          R.sum
        )(combinedBudget)
      : 100;
  });

  return {
    id: "gross-total",
    section: "Gross",
    category: "Total",
    ...COLUMN_HEADERS.reduce((acc, columnHeader, column) => {
      acc[columnHeader] = grossTotals[column];
      return acc;
    }, {}),
  };
};

const getTakeHomeRow = (
  combinedBudget: CombinedBudget,
  grossTotalRow: GridValidRowModel
): GridValidRowModel => {
  const takeHomeRow = {
    id: "take-home",
    section: "Take Home",
    category: "Total",
    ...COLUMN_HEADERS.reduce((acc, columnHeader, column) => {
      const person = getPersonFromColumn(column);
      const targetTime = getColumnTime(column);
      const grossTotal = grossTotalRow[columnHeader];

      const deductions = R.pipe(
        R.toPairs,
        (sections: [string, SectionData][]) =>
          R.filter(
            ([section, sectionData]: [string, SectionData]) =>
              sectionData.isPreTax && section !== "Gross",
            sections
          ),
        R.map(([, sectionData]) =>
          R.pipe(
            R.prop("categories"),
            R.values,
            R.map((categoryData: CombinedCategoryData) =>
              convertCurrency(categoryData[person], targetTime)
            ),
            R.sum
          )(sectionData)
        ),
        R.sum
      )(combinedBudget);

      acc[columnHeader] = isCurrencyColumn(column)
        ? grossTotal - deductions
        : 100;

      return acc;
    }, {}),
  };

  return takeHomeRow;
};

const getSavingsRow = (
  combinedBudget: CombinedBudget,
  takeHomeRow: GridValidRowModel
): GridValidRowModel => {
  const savingsRow = {
    id: "savings",
    section: "Savings",
    category: "Total",
    ...COLUMN_HEADERS.reduce((acc, columnHeader, column) => {
      const person = getPersonFromColumn(column);
      const targetTime = getColumnTime(column);

      const postTaxCosts = R.pipe(
        R.toPairs,
        (sections: [string, SectionData][]) =>
          R.filter(
            ([section, sectionData]: [string, SectionData]) =>
              !sectionData.isPreTax && section !== "Gross",
            sections
          ),
        R.map(([, sectionData]) =>
          R.pipe(
            R.prop("categories"),
            R.values,
            R.map((categoryData: CombinedCategoryData) =>
              convertCurrency(categoryData[person], targetTime)
            ),
            R.sum
          )(sectionData)
        ),
        R.sum
      )(combinedBudget);

      acc[columnHeader] = isCurrencyColumn(column)
        ? takeHomeRow[columnHeader] - postTaxCosts
        : 100;

      return acc;
    }, {}),
  };

  return savingsRow;
};

export const getDataRows = (combinedBudget: CombinedBudget) => {
  if (R.isEmpty(combinedBudget)) return [];

  const grossTotalRow = getGrossTotalRow(combinedBudget);
  const takeHomeRow = getTakeHomeRow(combinedBudget, grossTotalRow);
  const savingsRow = getSavingsRow(combinedBudget, takeHomeRow);

  const dataRows = R.pipe(
    R.mapObjIndexed(
      (sectionData: SectionData, section: string) =>
        ({
          section,
          isPreTax: sectionData.isPreTax,
          categories: R.pipe(
            R.prop("categories"),
            R.toPairs,
            R.sortBy(R.prop(0)),
            R.map(([category, data]: [string, CombinedCategoryData]) => ({
              id: `${section}-${category}`,
              section,
              category,
              isPreTax: sectionData.isPreTax,
              ...COLUMN_HEADERS.reduce((acc, columnHeader, column) => {
                const person = getPersonFromColumn(column);
                const targetTime = getColumnTime(column);

                if (isCurrencyColumn(column)) {
                  acc[columnHeader] = convertCurrency(data[person], targetTime);
                } else {
                  const cellTotal = convertCurrency(data[person], targetTime);
                  const grossTotal =
                    grossTotalRow[convertHeaderToCurrecy(columnHeader)];
                  acc[columnHeader] = Math.round(
                    (cellTotal / grossTotal) * 100
                  );
                }

                return acc;
              }, {}),
            })),
            R.flatten
          )(sectionData),
        } as PreProcessedSection)
    ),
    R.values,
    R.sortWith([R.ascend(R.prop("isPreTax")), R.ascend(R.prop("section"))]),
    R.map(R.prop("categories")),
    R.flatten
  )(combinedBudget);

  const posttaxRows = R.filter((row) => !row.isPreTax, dataRows);
  const pretaxRows = R.filter((row) => row.isPreTax, dataRows);

  return [
    ...posttaxRows,
    savingsRow,
    takeHomeRow,
    ...pretaxRows,
    grossTotalRow,
  ];
};
