import RefreshIcon from "@mui/icons-material/Refresh";
import { IconButton } from "@mui/material";
import {
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridRowsProp,
} from "@mui/x-data-grid";
import { Dispatch } from "react";

import FilterButton from "./Filter";
import {
  addContentToFirebase,
  fetchAllContentFromFirebase,
} from "./firebaseUtils";
import NextShow from "./NextShow";
import { EmZContent, fetchDataFromTMDB, Filter, TMDBGenre } from "./utils";
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
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  setRowsLoading: Dispatch<React.SetStateAction<boolean>>;
};
export default function TableToolbar({
  rows,
  genres,
  filters,
  setFilters,
  setRows,
  setRowsLoading,
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
      <IconButton
        onClick={() => {
          const RATE_LIMIT_RETRY_DELAY = 1000; // Retry after 1 second if a 429 is hit
          const delay = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));

          const fetchWithRetry = async (
            url: string,
            docData: EmZContent,
            isTv: boolean
          ) => {
            let attempts = 0;
            const MAX_ATTEMPTS = 5;

            while (attempts < MAX_ATTEMPTS) {
              try {
                const tmdbData = await fetchDataFromTMDB(url);
                if (!tmdbData) {
                  console.error("No data returned from TMDB for URL:", url);
                  return;
                }
                if (isTv) {
                  // docData.origin_country = tvData.origin_country;
                  docData.original_name = tmdbData.original_name;
                  // docData.first_air_date = tmdbData.first_air_date;
                  docData.name = tmdbData.name;
                  docData.next_episode_to_air = tmdbData.next_episode_to_air;
                  docData.seasons = tmdbData.seasons;
                  docData.watch_providers =
                    tmdbData["watch/providers"].results.US || [];
                  // docData.who = docData.who || "Both";
                  docData.episodes = tmdbData.number_of_episodes;
                  docData.ongoing = tmdbData.in_production;
                  docData.adult = tmdbData.adult;
                  docData.backdrop_path = tmdbData.backdrop_path;
                  docData.genre_ids = tmdbData.genres.map(
                    (genre: TMDBGenre) => genre.id
                  );
                  docData.original_language = tmdbData.original_language;
                  docData.overview = tmdbData.overview;
                  docData.popularity = tmdbData.popularity;
                  docData.poster_path = tmdbData.poster_path;
                  docData.vote_average = tmdbData.vote_average;
                  docData.vote_count = tmdbData.vote_count;
                } else {
                  docData.adult = tmdbData.adult;
                  docData.backdrop_path = tmdbData.backdrop_path;
                  docData.genre_ids = tmdbData.genres.map(
                    (genre: TMDBGenre) => genre.id
                  );
                  // docData.original_language = tmdbData.original_language;
                  docData.overview = tmdbData.overview;
                  docData.popularity = tmdbData.popularity;
                  docData.poster_path = tmdbData.poster_path;
                  docData.vote_average = tmdbData.vote_average;
                  docData.vote_count = tmdbData.vote_count;
                  // docData.who = docData.who || "Both";
                  docData.episodes = 1;
                  docData.ongoing = false;
                  docData.original_title = tmdbData.original_title;
                  docData.release_date = tmdbData.release_date;
                  docData.title = tmdbData.title;
                  docData.video = tmdbData.video;
                  docData.watch_providers =
                    tmdbData["watch/providers"].results.US || [];
                }

                await addContentToFirebase(docData)
                  .then(() => {
                    setRows((prevRows: GridRowsProp) => {
                      return prevRows.map((row) =>
                        row.id === docData.id ? { ...docData } : row
                      );
                    });
                  })
                  .catch((error) => {
                    console.error("Error updating content:", error);
                  });
                return;
              } catch (error) {
                console.log("Example error", error);
                if (error.status === 429 || error.code === 429) {
                  attempts++;
                  console.warn(
                    `Rate limit hit. Retrying in ${RATE_LIMIT_RETRY_DELAY}ms. Attempt ${attempts}/${MAX_ATTEMPTS}`
                  );
                  await delay(RATE_LIMIT_RETRY_DELAY);
                } else {
                  throw error;
                }
              }
            }
            console.error(
              `Failed to update doc ${docData.id} after ${MAX_ATTEMPTS} attempts.`
            );
          };

          const func = async () => {
            const startTime = performance.now();
            setRowsLoading(true);
            const data = await fetchAllContentFromFirebase();
            if (!data) {
              return;
            }
            const updateTasks: Promise<void>[] = [];
            data.docs.map((doc) => {
              const docData = doc.data();
              updateTasks.push(
                docData.media_type === "tv"
                  ? fetchWithRetry(
                      `https://api.themoviedb.org/3/tv/${docData.id}?append_to_response=watch%2Fproviders&language=en-US`,
                      docData as EmZContent,
                      true
                    )
                  : fetchWithRetry(
                      `https://api.themoviedb.org/3/movie/${docData.id}?append_to_response=watch%2Fproviders&language=en-US`,
                      docData as EmZContent,
                      false
                    )
              );
            });

            await Promise.all(updateTasks).then(() => {
              setRowsLoading(false);
              const endTime = performance.now();
              console.log(`Elapsed time: ${endTime - startTime} milliseconds`);
            });
          };

          func();
        }}
      >
        <RefreshIcon />
      </IconButton>
      <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );
}
