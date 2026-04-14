import { useState, MouseEvent } from "react";
import {
  Grid,
  Typography,
  TableSortLabel,
  IconButton,
  Menu,
  MenuItem,
  Stack,
} from "@mui/material";
import { Settings } from "@mui/icons-material";

import { ACCORDION_SUMMAR_HEADING_VARIANT, gridSizes } from "./constants";
import { ViewType } from "../types";

interface BudgetHeadersProps {
  sortColumn?: "monthly" | "yearly" | null;
  sortDirection?: "asc" | "desc";
  onSort?: (column: "monthly" | "yearly") => void;
  viewType?: ViewType;
  onViewTypeChange?: (viewType: ViewType) => void;
}

export default function BudgetHeaders({
  sortColumn,
  sortDirection,
  onSort,
  viewType,
  onViewTypeChange,
}: BudgetHeadersProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSelectViewType = (type: ViewType) => {
    if (onViewTypeChange) {
      onViewTypeChange(type);
    }
    handleMenuClose();
  };
  const viewLabel = {
    [ViewType.MONTHLY_AVERAGE]: "Monthly (Avg)",
    [ViewType.TWO_PAYCHECK]: "Monthly (2x)",
    [ViewType.THREE_PAYCHECK]: "Monthly (3x)",
  }[viewType ?? ViewType.MONTHLY_AVERAGE];

  return (
    <Grid container spacing={2} sx={{ paddingX: 2, alignItems: "center" }}>
      <Grid size={gridSizes.NAME}>
        <Typography variant={ACCORDION_SUMMAR_HEADING_VARIANT}>Name</Typography>
      </Grid>
      <Grid size={gridSizes.REPEAT_FREQ}>
        <Typography
          variant={ACCORDION_SUMMAR_HEADING_VARIANT}
          textAlign="center"
        >
          Frequency
        </Typography>
      </Grid>
      <Grid size={gridSizes.AMOUNT_MONTHLY}>
        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <Settings fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "left", vertical: "top" }}
            anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
          >
            <MenuItem
              selected={viewType === ViewType.MONTHLY_AVERAGE}
              onClick={() => handleSelectViewType(ViewType.MONTHLY_AVERAGE)}
            >
              Average Monthly
            </MenuItem>
            <MenuItem
              selected={viewType === ViewType.TWO_PAYCHECK}
              onClick={() => handleSelectViewType(ViewType.TWO_PAYCHECK)}
            >
              2 Paychecks
            </MenuItem>
            <MenuItem
              selected={viewType === ViewType.THREE_PAYCHECK}
              onClick={() => handleSelectViewType(ViewType.THREE_PAYCHECK)}
            >
              3 Paychecks
            </MenuItem>
          </Menu>
          <TableSortLabel
            active={sortColumn === "monthly"}
            direction={sortColumn === "monthly" ? sortDirection : "desc"}
            onClick={() => onSort && onSort("monthly")}
          >
            <Typography variant={ACCORDION_SUMMAR_HEADING_VARIANT}>
              {viewLabel}
            </Typography>
          </TableSortLabel>
        </Stack>
      </Grid>
      <Grid size={gridSizes.AMOUNT_YEARLY} sx={{ textAlign: "right" }}>
        <TableSortLabel
          active={sortColumn === "yearly"}
          direction={sortColumn === "yearly" ? sortDirection : "desc"}
          onClick={() => onSort && onSort("yearly")}
        >
          <Typography variant={ACCORDION_SUMMAR_HEADING_VARIANT}>
            Yearly
          </Typography>
        </TableSortLabel>
      </Grid>
      <Grid size={gridSizes.DELETE} />
    </Grid>
  );
}
