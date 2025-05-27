import {
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridRowsProp,
} from "@mui/x-data-grid";
import { Dispatch } from "react";

import FilterButton from "./Filter";
import NextShow from "./NextShow";
import { EmZContent, Filter } from "./utils";
import { EmZGenre } from "./utils";
export type TableToolbarProps = {
  filters: Record<string, Filter<EmZContent>>;
  setFilters: Dispatch<
    React.SetStateAction<Record<string, Filter<EmZContent>>>
  >;
};

export type CustomToolbarProps = {
  rows: GridRowsProp;
  genres: Record<number, EmZGenre> | null;
  filters: Record<string, Filter<EmZContent>>;
  setFilters: Dispatch<
    React.SetStateAction<Record<string, Filter<EmZContent>>>
  >;
};
export default function TableToolbar({
  rows,
  genres,
  filters,
  setFilters,
}: CustomToolbarProps) {
  return (
    <GridToolbarContainer>
      <NextShow rows={rows} genres={genres} />

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
      <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );
}
