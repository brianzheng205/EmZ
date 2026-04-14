import { Add } from "@mui/icons-material";
import { MenuItem, Select, SelectChangeEvent, Skeleton, Stack } from "@mui/material";
import { FbBudgetWithId } from "../types";

interface BudgetSelectorProps {
  loading: boolean;
  activeBudgetId: string;
  budgets: FbBudgetWithId[];
  onBudgetChange: (event: SelectChangeEvent<string>) => void;
}

export default function BudgetSelector({
  loading,
  activeBudgetId,
  budgets,
  onBudgetChange,
}: BudgetSelectorProps) {
  return (
    <Stack direction="row" alignItems="baseline">
      {loading ? (
        <Skeleton
          width={250}
          height={40}
          sx={{ transform: "none", my: "4px" }}
        />
      ) : (
        <Select
          value={activeBudgetId}
          onChange={onBudgetChange}
          variant="standard"
          disableUnderline
          displayEmpty
          sx={{
            typography: "h4",
            fontWeight: "bold",
            "& .MuiSelect-select": {
              padding: 0,
              paddingRight: "32px !important",
            },
          }}
        >
          <MenuItem disabled value="">
            <em>Select a budget...</em>
          </MenuItem>
          <MenuItem
            value="ADD_NEW_BUDGET"
            sx={{ color: "primary.main", fontWeight: "bold" }}
          >
            <Add fontSize="small" sx={{ mr: 1 }} /> Create New Budget...
          </MenuItem>
          {budgets.map((b) => (
            <MenuItem key={b.id} value={b.id}>
              {`${b.year ? b.year + " " : ""}${b.name} (${b.user})`}
            </MenuItem>
          ))}
        </Select>
      )}
    </Stack>
  );
}
