"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import * as R from "ramda";
import { useState } from "react";

import { NECESSARY_BUDGET_ITEM_NAMES } from "../constants";

import {
  CategoryWithItems,
  CalculatedBudget,
  BudgetItem,
  CalculatedCategories,
  CategoryWithNoItems,
  FbBudgetItem,
  Frequency,
  ViewType,
} from "../types";
import { convertToMonthlyAmount, convertToYearlyAmount } from "../utils";

import {
  FixedCurrencyCell,
  FixedNameCell,
  DisabledCell,
} from "./BudgetCells";
import {
  FixedRepeatFreqCell,
} from "./BudgetCells/RepeatCell";
import { ACCORDION_SUMMAR_HEADING_VARIANT, gridSizes } from "./constants";
import EditItemDialog from "./dialogs/EditItemDialog";

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
  onActiveBudgetItemDelete: () => void;
  onEditItem: () => void;
  numMonths: number;
  viewType: ViewType;
}

function CategoryItem({
  item,
  onActiveBudgetItemDelete,
  onEditItem,
  numMonths,
  viewType,
}: CategoryItemProps) {
  const isItemCalculated = item.type === "Liquid Assets";
  const itemNeverRepeats = item.frequency === Frequency.ONE_TIME;

  return (
    <Grid container spacing={2}>
      <Grid size={gridSizes.NAME}>
        <FixedNameCell name={item.name} />
      </Grid>
      <Grid size={gridSizes.REPEAT_FREQ}>
        <FixedRepeatFreqCell repeatFreq={item.frequency} />
      </Grid>
      <Grid size={gridSizes.AMOUNT_MONTHLY}>
        {itemNeverRepeats ? (
          <DisabledCell />
        ) : (
          <FixedCurrencyCell
            amount={convertToMonthlyAmount(item, viewType, numMonths)}
          />
        )}
      </Grid>
      <Grid size={gridSizes.AMOUNT_YEARLY}>
        <FixedCurrencyCell amount={convertToYearlyAmount(item, numMonths)} />
      </Grid>
      <Grid
        size={gridSizes.DELETE}
        sx={{ display: "flex", justifyContent: "center" }}
      >

        {!isItemCalculated && (
          <>
            <IconButton
              aria-label="edit"
              onClick={onEditItem}
              sx={{ padding: 0, mr: 0.5 }}
            >
              <EditIcon fontSize="small" color="primary" />
            </IconButton>
            {!NECESSARY_BUDGET_ITEM_NAMES.includes(item.name) && (
              <IconButton
                aria-label="delete"
                onClick={onActiveBudgetItemDelete}
                sx={{ padding: 0 }}
              >
                <DeleteIcon fontSize="small" color="primary" />
              </IconButton>
            )}
          </>
        )}
      </Grid>
    </Grid>
  );
}

interface BudgetAccordionProps {
  category: CategoryWithItems | CategoryWithNoItems;
  onActiveBudgetItemDelete: (name: string) => void;
  onEditItem: (item: BudgetItem) => void;
  numMonths: number;
  viewType: ViewType;
}

function CategoryAccordion({
  category,
  onActiveBudgetItemDelete,
  onEditItem,
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
              onActiveBudgetItemDelete={() =>
                onActiveBudgetItemDelete(item.name)
              }
              onEditItem={() => onEditItem(item)}
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
  const [itemToEdit, setItemToEdit] = useState<BudgetItem | null>(null);

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
          onActiveBudgetItemDelete={(itemName) =>
            onItemDelete(activeBudgets[0].id, itemName)
          }
          onEditItem={setItemToEdit}
          numMonths={activeBudgets[0].numMonths}
          viewType={viewType}
        />
      ))}

      <EditItemDialog
        open={!!itemToEdit}
        item={itemToEdit}
        allItemNames={allItemNames}
        onClose={() => setItemToEdit(null)}
        onSubmit={(oldItemName, newItem) => {
          onItemChange(activeBudgets[0].id, oldItemName, newItem);
          setItemToEdit(null);
        }}
      />
    </>
  );
}
