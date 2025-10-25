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
        <BudgetAmountCell amount={category.sumMonthly} isSummary />
      </Grid>
      <Grid size={3}>
        <BudgetAmountCell amount={category.sumYearly} isSummary />
      </Grid>
    </Grid>
  );
}

interface CategoryItemProps {
  item: BudgetItem;
}

function CategoryItem({ item }: CategoryItemProps) {
  return (
    <Grid container spacing={2}>
      <Grid size={3}>{item.name}</Grid>
      <Grid size={3}>{item.repeatFreq}</Grid>
      <Grid size={3}>
        <BudgetAmountCell amount={item.amountMonthly} />
      </Grid>
      <Grid size={3}>
        <BudgetAmountCell amount={item.amountYearly} />
      </Grid>
    </Grid>
  );
}

interface BudgetAccordionProps {
  category: CategoryWithItems | CategoryWithNoItems;
}

function CategoryAccordion({ category }: BudgetAccordionProps) {
  const hasItems = "items" in category;

  return (
    <Accordion disabled={!hasItems} sx={{ margin: 0 }}>
      <AccordionSummary>
        <CategorySummary category={category as CategoryWithItems} />
      </AccordionSummary>
      {hasItems && (
        <AccordionDetails sx={{ margin: 0 }}>
          {(category as CategoryWithItems).items.map((item) => (
            <CategoryItem key={item.name} item={item} />
          ))}
        </AccordionDetails>
      )}
    </Accordion>
  );
}

interface BudgetAccordionsProps {
  activeBudgets: CalculatedBudget[];
}

export default function BudgetAccordions({
  activeBudgets,
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
      {categoryOrder.map((key) => (
        <CategoryAccordion key={key} category={categories[key]} />
      ))}
    </>
  );
}
