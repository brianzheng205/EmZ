import { FbBudgetItem, Frequency, ItemType } from "./types";

export const NECESSARY_BUDGET_ITEMS: FbBudgetItem[] = [
  {
    type: ItemType.EARNINGS,
    name: "Base",
    amount: 0,
    frequency: Frequency.BIWEEKLY,
    isDefinedYearly: false,
  },
  {
    type: ItemType.EARNINGS,
    name: "RSU",
    amount: 0,
    frequency: Frequency.MONTHLY,
    isDefinedYearly: true,
  },
];

export const NECESSARY_BUDGET_ITEM_NAMES = NECESSARY_BUDGET_ITEMS.map((item) => item.name);
