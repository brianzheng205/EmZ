import { GridToolbarContainer } from "@mui/x-data-grid";
import { Dispatch } from "react";

import FilterButton from "./Filter";
import { EmZContent, Filter } from "./utils";

export type TableToolbarProps = {
  filters: Record<string, Filter<EmZContent>>;
  setFilters: Dispatch<
    React.SetStateAction<Record<string, Filter<EmZContent>>>
  >;
};
export default function TableToolbar({
  filters,
  setFilters,
}: TableToolbarProps) {
  return (
    <GridToolbarContainer>
      <FilterButton
        filters={filters}
        setFilters={setFilters}
        filter={{
          name: "completedFilter",
          filter: (items) =>
            items.filter((item) => item.watched < item.episodes),
        }}
        buttonText="Filter Out Completed"
      />
      <FilterButton
        filters={filters}
        setFilters={setFilters}
        filter={{
          name: "completedAndOngoingFilter",
          filter: (items) =>
            items.filter(
              (item) => item.watched < item.episodes || item.ongoing
            ),
        }}
        buttonText="Filter Out Completed and Not Ongoing"
      />
    </GridToolbarContainer>
  );
}
