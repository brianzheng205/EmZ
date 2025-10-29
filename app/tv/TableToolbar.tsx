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
import {
  Content,
  EmZContent,
  fetchDataFromTMDB,
  Filter,
  TMDBGenre,
} from "./utils";
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
  fetchData: () => Promise<void>;
};
export default function TableToolbar({
  rows,
  genres,
  filters,
  setFilters,
  fetchData,
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
          const func = async () => {
            const data = await fetchAllContentFromFirebase();
            for (const doc of data.docs) {
              const docData = doc.data();

              if (docData.media_type === "tv") {
                const tvData = await fetchDataFromTMDB(
                  `https://api.themoviedb.org/3/tv/${docData.id}?append_to_response=watch%2Fproviders&language=en-US`
                );
                docData.origin_country = tvData.origin_country;
                docData.original_name = tvData.original_name;
                docData.first_air_date = tvData.first_air_date;
                docData.name = tvData.name;
                docData.next_episode_to_air = tvData.next_episode_to_air;
                docData.seasons = tvData.seasons;
                docData.watch_providers =
                  tvData["watch/providers"].results.US || [];
                docData.who = docData.who || "Both";
                docData.episodes = tvData.number_of_episodes;
                docData.ongoing = tvData.in_production;
                docData.adult = tvData.adult;
                docData.backdrop_path = tvData.backdrop_path;
                docData.genre_ids = tvData.genres.map(
                  (genre: TMDBGenre) => genre.id
                );
                docData.original_language = tvData.original_language;
                docData.overview = tvData.overview;
                docData.popularity = tvData.popularity;
                docData.poster_path = tvData.poster_path;
                docData.vote_average = tvData.vote_average;
                docData.vote_count = tvData.vote_count;
              } else if (docData.media_type === "movie") {
                const movieData = await fetchDataFromTMDB(
                  `https://api.themoviedb.org/3/movie/${docData.id}?append_to_response=watch%2Fproviders&language=en-US`
                );
                docData.adult = movieData.adult;
                docData.backdrop_path = movieData.backdrop_path;
                docData.genre_ids = movieData.genres.map(
                  (genre: TMDBGenre) => genre.id
                );
                docData.original_language = movieData.original_language;
                docData.overview = movieData.overview;
                docData.popularity = movieData.popularity;
                docData.poster_path = movieData.poster_path;
                docData.vote_average = movieData.vote_average;
                docData.vote_count = movieData.vote_count;
                docData.who = docData.who || "Both";
                docData.episodes = 1;
                docData.ongoing = false;
                docData.original_title = movieData.original_title;
                docData.release_date = movieData.release_date;
                docData.title = movieData.title;
                docData.video = movieData.video;
                docData.watch_providers =
                  movieData["watch/providers"].results.US || [];
              }

              addContentToFirebase(docData as Content);
            }
            fetchData();
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
