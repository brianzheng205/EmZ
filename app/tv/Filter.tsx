import { Button } from "@mui/material";

import { TableToolbarProps } from "./TableToolbar";
import { EmZContent, Filter } from "./utils";

export interface FilterButtonProps<T> extends TableToolbarProps {
  filter: Filter<T>;
  buttonText: string;
}
export default function FilterButton({
  filters,
  setFilters,
  filter,
  buttonText,
}: FilterButtonProps<EmZContent>) {
  return (
    <Button
      onClick={() => {
        if (filters[filter.name]) {
          setFilters((prev) => {
            const newFilters = { ...prev };
            delete newFilters[filter.name];
            return newFilters;
          });
        } else {
          setFilters((prev) => ({
            ...prev,
            [filter.name]: {
              ...filter,
            },
          }));
        }
      }}
      color={filters[filter.name] ? "primary" : "secondary"}
    >
      {buttonText}
    </Button>
  );
}
