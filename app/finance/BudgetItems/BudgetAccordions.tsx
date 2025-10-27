"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Typography,
} from "@mui/material";

import {
  CategoryWithItems,
  CalculatedBudget,
  BudgetItem,
  CalculatedCategories,
  CategoryWithNoItems,
  OnActiveBudgetItemChangeFn,
  OnActiveItemChangeFn,
  OnItemChangeFn,
} from "../types";

import { BudgetAmountCell } from "./BudgetCells";
import { VARIANT } from "./constants";

interface CategorySummaryProps {
  category: CategoryWithItems | CategoryWithNoItems;
}

function CategorySummary({ category }: CategorySummaryProps) {
  return (
    <Grid container spacing={2} sx={{ flexGrow: 1, alignItems: "center" }}>
      <Grid size={3}>
        <Typography variant={VARIANT}>{category.name}</Typography>
      </Grid>
      <Grid size={3}>
        <Typography variant={VARIANT}></Typography>
      </Grid>
      <Grid size={3}>
        <BudgetAmountCell initialAmount={category.sumMonthly} isSummary />
      </Grid>
      <Grid size={3}>
        <BudgetAmountCell initialAmount={category.sumYearly} isSummary />
      </Grid>
    </Grid>
  );
}

interface CategoryItemProps {
  item: BudgetItem;
  onActiveBudgetItemChange?: OnItemChangeFn;
}

function CategoryItem({
  item,
  onActiveBudgetItemChange = () => {},
}: CategoryItemProps) {
  const onAmountChange = (
    amount: number,
    amountTimeSpan: "Monthly" | "Yearly"
  ) => {
    if (item.type === "Liquid Assets") {
      console.error("Cannot change liquid assets amount");
      return;
    }

    onActiveBudgetItemChange({
      type: item.type,
      name: item.name,
      amount,
      amountTimeSpan,
      repeatFreq: item.repeatFreq,
    });
  };
  return (
    <Grid container spacing={2}>
      <Grid size={3}>{item.name}</Grid>
      <Grid size={3}>{item.repeatFreq}</Grid>
      <Grid size={3}>
        <BudgetAmountCell
          initialAmount={item.amountMonthly}
          editable
          onActiveBudgetItemChange={(amount) =>
            onAmountChange(amount, "Monthly")
          }
        />
      </Grid>
      <Grid size={3}>
        <BudgetAmountCell
          initialAmount={item.amountYearly}
          editable
          onActiveBudgetItemChange={(amount) =>
            onAmountChange(amount, "Yearly")
          }
        />
      </Grid>
    </Grid>
  );
}

interface BudgetAccordionProps {
  category: CategoryWithItems | CategoryWithNoItems;
  onActiveBudgetItemChange: OnActiveItemChangeFn;
}

function CategoryAccordion({
  category,
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
        <AccordionDetails>
          {(category as CategoryWithItems).items.map((item, index) => (
            <CategoryItem
              key={index}
              item={item}
              onActiveBudgetItemChange={(newItem) =>
                onActiveBudgetItemChange(item, newItem)
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
  onItemChange: OnActiveBudgetItemChangeFn;
}

export default function BudgetAccordions({
  activeBudgets,
  onItemChange,
}: BudgetAccordionsProps) {
  // properties for just the first active budget
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
          onActiveBudgetItemChange={(oldItem, newItem) =>
            onItemChange(activeBudgets[0].id, oldItem, newItem)
          }
        />
      ))}
    </>
  );
}
