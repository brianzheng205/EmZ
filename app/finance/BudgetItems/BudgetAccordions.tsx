"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Typography,
} from "@mui/material";
import * as R from "ramda";

import {
  CategoryWithItems,
  CalculatedBudget,
  BudgetItem,
  CalculatedCategories,
  CategoryWithNoItems,
  FbBudgetItem,
  ItemRepeatFreq,
  ItemAmountTimeSpan,
} from "../types";

import {
  EditableCurrencyCell,
  EditableNameCell,
  FixedCurrencyCell,
  FixedNameCell,
} from "./BudgetCells";
import {
  EditableRepeatFreqCell,
  FixedRepeatFreqCell,
} from "./BudgetCells/RepeatCell";
import { ACCORDION_SUMMAR_HEADING_VARIANT } from "./constants";

interface CategorySummaryProps {
  category: CategoryWithItems | CategoryWithNoItems;
}

function CategorySummary({ category }: CategorySummaryProps) {
  return (
    <Grid container spacing={2} sx={{ flexGrow: 1, alignItems: "center" }}>
      <Grid size={3}>
        <Typography variant={ACCORDION_SUMMAR_HEADING_VARIANT}>
          {category.name}
        </Typography>
      </Grid>
      <Grid size={3}>
        <Typography variant={ACCORDION_SUMMAR_HEADING_VARIANT}></Typography>
      </Grid>
      <Grid size={3}>
        <FixedCurrencyCell amount={category.sumMonthly} isSummary />
      </Grid>
      <Grid size={3}>
        <FixedCurrencyCell amount={category.sumYearly} isSummary />
      </Grid>
    </Grid>
  );
}

interface CategoryItemProps {
  item: BudgetItem;
  allItemNames: string[];
  onActiveBudgetItemChange?: (newItem: Partial<FbBudgetItem>) => void;
}

function CategoryItem({
  item,
  allItemNames,
  onActiveBudgetItemChange = () => {},
}: CategoryItemProps) {
  const isItemCalculated = item.type === "Liquid Assets";
  const doesItemRepeat = item.repeatFreq === "Never";

  const onNameChange = (name: string) => {
    onActiveBudgetItemChange({ name });
  };

  const onRepeatFreqChange = (repeatFreq: ItemRepeatFreq) => {
    onActiveBudgetItemChange({ repeatFreq });
  };

  const onAmountChange = (
    amount: number,
    amountTimeSpan: ItemAmountTimeSpan
  ) => {
    onActiveBudgetItemChange({
      amount,
      amountTimeSpan,
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid size={3}>
        {isItemCalculated ? (
          <FixedNameCell name={item.name} />
        ) : (
          <EditableNameCell
            name={item.name}
            allItemNames={allItemNames}
            onItemNameChange={onNameChange}
          />
        )}
      </Grid>
      <Grid size={3}>
        {isItemCalculated ? (
          <FixedRepeatFreqCell repeatFreq={item.repeatFreq} />
        ) : (
          <EditableRepeatFreqCell
            repeatFreq={item.repeatFreq}
            onItemRepeatFreqChange={onRepeatFreqChange}
          />
        )}
      </Grid>
      <Grid size={3}>
        {isItemCalculated || doesItemRepeat ? (
          <FixedCurrencyCell amount={item.amountMonthly} />
        ) : (
          <EditableCurrencyCell
            amount={item.amountMonthly}
            onItemAmountChange={(amount) =>
              onAmountChange(amount, ItemAmountTimeSpan.MONTHLY)
            }
          />
        )}
      </Grid>
      <Grid size={3}>
        {isItemCalculated ? (
          <FixedCurrencyCell amount={item.amountYearly} />
        ) : (
          <EditableCurrencyCell
            amount={item.amountYearly}
            onItemAmountChange={(amount) =>
              onAmountChange(amount, ItemAmountTimeSpan.YEARLY)
            }
          />
        )}
      </Grid>
    </Grid>
  );
}

interface BudgetAccordionProps {
  category: CategoryWithItems | CategoryWithNoItems;
  allItemNames: string[];
  onActiveBudgetItemChange: (
    oldItemName: string,
    newItem: Partial<FbBudgetItem>
  ) => void;
}

function CategoryAccordion({
  category,
  allItemNames,
  onActiveBudgetItemChange,
}: BudgetAccordionProps) {
  const hasItems = "items" in category;

  return (
    <Accordion
      disabled={!hasItems}
      sx={{
        "&.Mui-expanded": {
          margin: 0,
        },
      }}
    >
      <AccordionSummary>
        <CategorySummary category={category as CategoryWithItems} />
      </AccordionSummary>
      {hasItems && (
        <AccordionDetails
          sx={{ display: "flex", flexDirection: "column", gap: 1 }}
        >
          {(category as CategoryWithItems).items.map((item, index) => (
            <CategoryItem
              key={index}
              item={item}
              allItemNames={allItemNames}
              onActiveBudgetItemChange={(newItem) =>
                onActiveBudgetItemChange(item.name, newItem)
              }
            />
          ))}
        </AccordionDetails>
      )}
    </Accordion>
  );
}

interface BudgetAccordionsProps {
  activeBudgets: CalculatedBudget[];
  onItemChange: (
    budgetId: string,
    oldItemName: string,
    newItem: Partial<FbBudgetItem>
  ) => void;
}

export default function BudgetAccordions({
  activeBudgets,
  onItemChange,
}: BudgetAccordionsProps) {
  // properties for just the first active budget
  const allItemNames: string[] = [];

  R.values(activeBudgets[0].categories).forEach((category) => {
    if ("items" in category) {
      category.items.forEach((item) => {
        allItemNames.push(item.name);
      });
    }
  });

  const categories = activeBudgets[0].categories;
  const categoryOrder: (keyof CalculatedCategories)[] = [
    "earnings",
    "deductions",
    "taxes",
    "takeHome",
    "expenses",
    "retirement",
    "liquidAssets",
  ];

  // TODO: add support for multiple active budgets. For now, just show the first one.
  return (
    <>
      {categoryOrder.map((key, index) => (
        <CategoryAccordion
          key={index}
          category={categories[key]}
          allItemNames={allItemNames}
          onActiveBudgetItemChange={(oldItemName, newItem) =>
            onItemChange(activeBudgets[0].id, oldItemName, newItem)
          }
        />
      ))}
    </>
  );
}
