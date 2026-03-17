import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import { IconButton, Stack, Box } from "@mui/material";
import { Dispatch } from "react";

import FilterButton from "./Filter";
import {
  addContentToFirebase,
  fetchAllContentFromFirebase,
} from "./firebaseUtils";
import NextShow from "./NextShow";
import {
  EmZContent,
  fetchDataFromTMDB,
  Filter,
  TMDBError,
  WhoSelection,
  EmZGenre,
} from "./utils";

import {
  mapTvData,
  mapMovieData,
  findNewCollectionMovies,
  fetchContentUpdatesFromTMDB as sharedFetchContentUpdates,
  CollectionRef,
  delay,
} from "@shared/tv/functions";
export type TableToolbarProps = {
  filters: Record<string, Filter<EmZContent>>;
  setFilters: Dispatch<
    React.SetStateAction<Record<string, Filter<EmZContent>>>
  >;
};

export type CustomToolbarProps = {
  rows: EmZContent[];
  genres: Record<number, EmZGenre> | null;
  filters: Record<string, Filter<EmZContent>>;
  setFilters: Dispatch<
    React.SetStateAction<Record<string, Filter<EmZContent>>>
  >;
  setRows: React.Dispatch<React.SetStateAction<EmZContent[]>>;
  setRowsLoading: Dispatch<React.SetStateAction<boolean>>;
  onOpenSettings: () => void;
};
export default function TableToolbar({
  rows,
  genres,
  filters,
  setFilters,
  setRows,
  setRowsLoading,
  onOpenSettings,
}: CustomToolbarProps) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ mb: 2, alignItems: "center", flexWrap: "wrap" }}
    >
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
              (item) => item.watched < item.episodes || item.ongoing,
            ),
        }}
        buttonText="Filter Out Completed and Not Ongoing"
      />

      <Box sx={{ flexGrow: 1 }} />

      <input
        type="search"
        placeholder="Search table..."
        style={{
          padding: "8px 12px",
          borderRadius: 4,
          border: "1px solid #ccc",
          outline: "none",
        }}
        onChange={(e) => {
          const val = e.target.value.toLowerCase();
          setFilters((prev) => {
            const newFilters = { ...prev };
            if (val) {
              newFilters["quickFilter"] = {
                name: "quickFilter",
                filter: (items) =>
                  items.filter((item) => {
                    const nameMatch =
                      item.name?.toLowerCase().includes(val) ||
                      item.title?.toLowerCase().includes(val);
                    const genreMatch = item.genre_ids?.some((id) =>
                      genres?.[id]?.name.toLowerCase().includes(val),
                    );
                    const whoMatch = item.who?.toLowerCase().includes(val);
                    return nameMatch || genreMatch || whoMatch;
                  }),
              };
            } else {
              delete newFilters["quickFilter"];
            }
            return newFilters;
          });
        }}
      />
      <IconButton
        onClick={async () => {
          setRowsLoading(true);
          const data = await fetchAllContentFromFirebase();
          if (!data) {
            setRowsLoading(true); // Should probably be false but following original logic
            return;
          }

          const docsToUpdate = data.docs.map((doc) => doc.data() as EmZContent);

          // Define the callbacks for the shared logic
          const saveDoc = async (id: string, updatedData: any) => {
            await addContentToFirebase(updatedData as EmZContent);
          };

          const onDocUpdated = (id: number, updatedData: any) => {
            setRows((prevRows: EmZContent[]) =>
              prevRows.map((row) => (row.id === id ? { ...updatedData } : row)),
            );
          };

          const onNewDoc = (newDocData: any) => {
            setRows((prev) => [...prev, newDocData as EmZContent]);
          };

          await sharedFetchContentUpdates(
            docsToUpdate,
            process.env.NEXT_PUBLIC_TMDB_API_KEY || "",
            saveDoc,
            onDocUpdated,
            onNewDoc,
          );

          setRowsLoading(false);
        }}
      >
        <RefreshIcon />
      </IconButton>
      <IconButton onClick={onOpenSettings} title="Manage Providers">
        <SettingsIcon color="primary" />
      </IconButton>
    </Stack>
  );
}
