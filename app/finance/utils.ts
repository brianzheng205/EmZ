import {
  GridColDef,
  GridValidRowModel,
  GridRowsProp,
  GridValueFormatter,
} from "@mui/x-data-grid";
import * as R from "ramda";

type BudgetData = {
  amount: number;
  time: "month" | "year";
};

type BudgetItem = BudgetData & {
  name: string;
};

type CategoryData = {
  isPreTax: boolean;
  items: BudgetItem[];
};

export type Budget = {
  [category: string]: CategoryData;
};

type BudgetItemPerson = BudgetData & {
  __owner: "person1" | "person2";
};

type CombinedBudgetItem = {
  name: string;
  person1: BudgetData;
  person2: BudgetData;
};

type CombinedCategoryData = {
  isPreTax: boolean;
  items: CombinedBudgetItem[];
};

type CombinedBudget = {
  [category: string]: CombinedCategoryData;
};

// TODO make calculated cells not editable
// TODO create docstrings for all functions

// HELPERS
const getPersonFromColumn = (column: number) =>
  column < 4 ? "person1" : "person2";

const getColumnTime = (column: number) =>
  [0, 1, 4, 5].includes(column) ? "month" : "year";

const isPercentColumn = (column: number) => column % 2 === 0;
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

export const renameBudgetFields = (budget: Budget) =>
  R.map(
    R.evolve({
      items: R.map((item: BudgetItem) => ({
        name: item.name,
      })),
    }),
    budget
  );

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
    editable: true,
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
): GridRowsProp =>
  R.pipe(
    R.toPairs,
    R.map(([categoryName, category]: [string, CombinedCategoryData]) =>
      R.map((item) => {
        const person1Amount = R.has("person1", item)
          ? convertCurrency(item.person1, item.person1.time)
          : 0;
        const person2Amount = R.has("person2", item)
          ? convertCurrency(item.person2, item.person2.time)
          : 0;
        return {
          id: `${categoryName}-${item.name}`,
          category: categoryName,
          name: item.name,
          isPreTax: category.isPreTax,
          ...COLUMN_HEADERS.reduce((acc, columnHeader, column) => {
            const divider =
              dividerRow[convertColumnHeaderToCurrency(columnHeader)];
            console.log(divider);
            const person = getPersonFromColumn(column);
            const amount = person === "person1" ? person1Amount : person2Amount;
            acc[columnHeader] = isCurrencyColumn(column)
              ? amount
              : divider > 0
              ? Math.round(amount / divider) * 100
              : 0;
            return acc;
          }, {}),
        };
      }, category.items)
    ),
    R.flatten
  )(combinedBudget);

const getGrossTotalRow = (combinedBudget: CombinedBudget) => {
  const grossTotals = COLUMN_HEADERS.map((_, column) => {
    if (isPercentColumn(column)) {
      return 100;
    }

    const person = getPersonFromColumn(column);
    const items: BudgetItemPerson[] = R.pathOr(
      [],
      ["Gross", "items"],
      combinedBudget
    );
    const amounts = R.map((item) => {
      if (R.has(person, item)) {
        return convertCurrency(item[person], getColumnTime(column));
      }
      return 0;
    }, items);
    const total = R.sum(amounts);
    return total;
  });

  return {
    id: "gross-total",
    category: "Gross",
    name: "Total",
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

export const combineBudgets = (
  budget1: Budget,
  budget2: Budget
): CombinedBudget => {
  // Merge categories
  const allCategories = R.union(R.keys(budget1), R.keys(budget2));

  return R.fromPairs(
    allCategories.map((cat: string) => {
      const cat1 = budget1[cat] || { isPreTax: false, items: [] };
      const cat2 = budget2[cat] || { isPreTax: false, items: [] };

      // Group items by name
      const groupByName = R.groupBy(R.propOr("", "name"));
      const grouped = groupByName([
        ...cat1.items.map((i) => ({ ...i, __owner: "person1" })),
        ...cat2.items.map((i) => ({ ...i, __owner: "person2" })),
      ]);

      const mergedItems = R.pipe(
        R.toPairs,
        R.map(([name, items]: [string, BudgetItemPerson[]]) => ({
          name,
          ...R.fromPairs(
            items.map((i) => [i.__owner, { amount: i.amount, time: i.time }])
          ),
        }))
      )(grouped);

      return [
        cat,
        {
          isPreTax: cat1.isPreTax || cat2.isPreTax,
          items: mergedItems,
        },
      ];
    })
  );
};

// export const combineBudgets = (
//   emilyBudget: Budget,
//   brianBudget: Budget
// ): CombinedBudget => {
//   const result: CombinedBudget = {};
//   const categories = R.union(R.keys(emilyBudget), R.keys(brianBudget));

//   R.forEach((category: string) => {
//     const emilyCategoryData: CategoryData = R.propOr({}, category, emilyBudget);
//     const brianCategoryData: CategoryData = R.propOr({}, category, brianBudget);
//     const isPreTax: boolean =
//       R.propOr(false, "isPreTax", emilyCategoryData) ||
//       R.propOr(false, "isPreTax", brianCategoryData);

//     const emilyItems: BudgetItemsPerson = R.pipe(
//       R.propOr([], "items"),
//       R.map((item: BudgetItem) => [
//         item.name,
//         {
//           ...item,
//           person: "emily",
//         },
//       ]),
//       R.fromPairs
//     )(emilyCategoryData);
//     console.log(emilyItems);
//     const brianItems: BudgetItemsPerson = R.pipe(
//       R.propOr([], "items"),
//       R.map((item: BudgetItem) => ({
//         ...item,
//         person: "brian",
//       }))
//     )(brianCategoryData);
//     const items = emilyItems.concat(brianItems);

//     const combinedItems = R.pipe(
//       R.groupBy((item: BudgetItem) => item.name),
//       R.map((items: BudgetItemsPerson[]) => {
//         const emilyItem = R.find(R.propEq("person", "emily"), items);
//         const brianItem = R.find(R.propEq("person", "brian"), items);

//         return {
//           name: emilyItem.name,
//           emily: {
//             amount: emilyItem.amount,
//             time: emilyItem.time,
//           },
//           brian: {
//             amount: brianItem.amount,
//             time: brianItem.time,
//           },
//         };
//       })
//     )(items);
//     console.log(combinedItems);

//     // result[category] = {
//     //   isPreTax,
//     //   items:
//     // };
//   }, categories);

//   return result;
// };
