"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  IconButton,
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
  Frequency,
  AmountBasis,
  ViewType,
} from "../types";
import { convertBudgetItemAmount } from "../utils";

import {
  EditableCurrencyCell,
  EditableNameCell,
  FixedCurrencyCell,
  FixedNameCell,
  DisabledCell,
} from "./BudgetCells";
import {
  EditableRepeatFreqCell,
  FixedRepeatFreqCell,
} from "./BudgetCells/RepeatCell";
import { ACCORDION_SUMMAR_HEADING_VARIANT, gridSizes } from "./constants";

interface CategorySummaryProps {
  category: CategoryWithItems | CategoryWithNoItems;
}

function CategorySummary({ category }: CategorySummaryProps) {
  return (
    <Grid container spacing={2} sx={{ flexGrow: 1, alignItems: "center" }}>
      <Grid size={gridSizes.NAME}>
        <Typography variant={ACCORDION_SUMMAR_HEADING_VARIANT}>
          {category.name}
        </Typography>
      </Grid>
      <Grid size={gridSizes.REPEAT_FREQ} />
      <Grid size={gridSizes.AMOUNT_MONTHLY}>
        <FixedCurrencyCell amount={category.sumMonthly} isSummary />
      </Grid>
      <Grid size={gridSizes.AMOUNT_YEARLY}>
        <FixedCurrencyCell amount={category.sumYearly} isSummary />
      </Grid>
      <Grid size={gridSizes.DELETE} />
    </Grid>
  );
}

interface CategoryItemProps {
  item: BudgetItem;
  allItemNames: string[];
  onActiveBudgetItemChange: (newItem: Partial<FbBudgetItem>) => void;
  onActiveBudgetItemDelete: () => void;
  numMonths: number;
  viewType: ViewType;
}

function CategoryItem({
  item,
  allItemNames,
  onActiveBudgetItemChange,
  onActiveBudgetItemDelete,
  numMonths,
  viewType,
}: CategoryItemProps) {
  const isItemCalculated = item.type === "Liquid Assets";
  const itemNeverRepeats = item.frequency === Frequency.ONE_TIME;

  const onNameChange = (name: string) => onActiveBudgetItemChange({ name });

  const onFrequencyChange = (frequency: Frequency) =>
    onActiveBudgetItemChange({ frequency });

  const onAmountChange = (newAmount: number, newBasis: AmountBasis) =>
    onActiveBudgetItemChange({ amount: newAmount, basis: newBasis });

  return (
    <Grid container spacing={2}>
      <Grid size={gridSizes.NAME}>
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
      <Grid size={gridSizes.REPEAT_FREQ}>
        {isItemCalculated ? (
          <FixedRepeatFreqCell repeatFreq={item.frequency} />
        ) : (
          <EditableRepeatFreqCell
            repeatFreq={item.frequency}
            onItemRepeatFreqChange={onFrequencyChange}
          />
        )}
      </Grid>
      <Grid size={gridSizes.AMOUNT_MONTHLY}>
        {itemNeverRepeats ? (
          <DisabledCell />
        ) : isItemCalculated ? (
          <FixedCurrencyCell
            amount={convertBudgetItemAmount(item, AmountBasis.MONTHLY)}
          />
        ) : (
          <EditableCurrencyCell
            displayAmount={convertBudgetItemAmount(item, AmountBasis.MONTHLY)}
            editAmount={convertBudgetItemAmount(item, AmountBasis.MONTHLY)}
            onItemAmountChange={(amount) =>
              onAmountChange(amount, AmountBasis.MONTHLY)
            }
            isHighlighted={item.basis === AmountBasis.MONTHLY}
          />
        )}
      </Grid>
      <Grid size={gridSizes.AMOUNT_YEARLY}>
        {isItemCalculated ? (
          <FixedCurrencyCell
            amount={convertBudgetItemAmount(item, AmountBasis.YEARLY)}
          />
        ) : (
          <EditableCurrencyCell
            displayAmount={convertBudgetItemAmount(item, AmountBasis.YEARLY)}
            editAmount={convertBudgetItemAmount(item, AmountBasis.YEARLY)}
            onItemAmountChange={(amount) =>
              onAmountChange(amount, AmountBasis.YEARLY)
            }
            isHighlighted={item.basis === AmountBasis.YEARLY}
          />
        )}
      </Grid>
      <Grid
        size={gridSizes.DELETE}
        sx={{ display: "flex", justifyContent: "center" }}
      >
        {!isItemCalculated && (
          <IconButton
            aria-label="delete"
            onClick={onActiveBudgetItemDelete}
            sx={{ padding: 0 }}
          >
            <DeleteIcon fontSize="small" color="primary" />
          </IconButton>
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
    newItem: Partial<FbBudgetItem>,
  ) => void;
  onActiveBudgetItemDelete: (name: string) => void;
  numMonths: number;
  viewType: ViewType;
}

function CategoryAccordion({
  category,
  allItemNames,
  onActiveBudgetItemChange,
  onActiveBudgetItemDelete,
  numMonths,
  viewType,
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
              onActiveBudgetItemDelete={() =>
                onActiveBudgetItemDelete(item.name)
              }
              numMonths={numMonths}
              viewType={viewType}
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
    newItem: Partial<FbBudgetItem>,
  ) => void;
  onItemDelete: (budgetId: string, itemName: string) => void;
  viewType: ViewType;
}

export default function BudgetAccordions({
  activeBudgets,
  onItemChange,
  onItemDelete,
  viewType,
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
          onActiveBudgetItemDelete={(itemName) =>
            onItemDelete(activeBudgets[0].id, itemName)
          }
          numMonths={activeBudgets[0].numMonths}
          viewType={viewType}
        />
      ))}
    </>
  );
}
