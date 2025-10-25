"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Typography,
} from "@mui/material";

import {
  BudgetItemCategory,
  CalculatedBudget,
  BudgetItem,
  CalculatedCategories,
  CalculatedCategory,
} from "../types";

import { BudgetAmountCell } from "./BudgetCells";
import { VARIANT } from "./constants";

interface CategorySummaryProps {
  category: CalculatedCategory;
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
  categoryKey: keyof CalculatedCategories;
  category: BudgetItemCategory | CalculatedCategory;
}

function CategoryAccordion({ categoryKey, category }: BudgetAccordionProps) {
  return ["earnings", "deductions", "expenses", "retirement"].includes(
    categoryKey
  ) ? (
    <Accordion>
      <AccordionSummary>
        <CategorySummary category={category as CalculatedCategory} />
      </AccordionSummary>
      <AccordionDetails>
        {(category as BudgetItemCategory).items.map((item) => (
          <CategoryItem key={item.name} item={item} />
        ))}
      </AccordionDetails>
    </Accordion>
  ) : (
    <Accordion disabled>
      <AccordionSummary>
        <CategorySummary category={category as CalculatedCategory} />
      </AccordionSummary>
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
  console.log(categories);

  // TODO: add support for multiple active budgets. For now, just show the first one.
  return (
    <>
      {Object.entries(categories).map(([key, category]) => (
        <CategoryAccordion
          key={key}
          categoryKey={key as keyof CalculatedCategories}
          category={category}
        />
      ))}
    </>
  );
}
