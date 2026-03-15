import { ToggleButtonGroup, ToggleButton } from "@mui/material";

import { ViewType } from "../types";

interface ViewToggleProps {
  viewType: ViewType;
  onViewTypeChange: (viewType: ViewType) => void;
}

export default function ViewToggle({
  viewType,
  onViewTypeChange,
}: ViewToggleProps) {
  return (
    <ToggleButtonGroup
      value={viewType}
      exclusive
      onChange={(_, newViewType) => onViewTypeChange(newViewType)}
      aria-label="view type"
    >
      <ToggleButton value={ViewType.TWO_PAYCHECK}>2 Paycheck</ToggleButton>
      <ToggleButton value={ViewType.MONTHLY_AVERAGE}>Monthly Avg</ToggleButton>
      <ToggleButton value={ViewType.THREE_PAYCHECK}>3 Paycheck</ToggleButton>
    </ToggleButtonGroup>
  );
}
