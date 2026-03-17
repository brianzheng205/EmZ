import { GridRowsProp } from "@mui/x-data-grid";
import { 
  EmZContent, 
  Movie, 
  TVShow, 
  NextEpisodeToAir, 
  Season, 
  Provider, 
  TMDBSearchMultiResponse, 
  TMDBGenre, 
  EmZGenre, 
  WhoSelection,
  TMDBError
} from "@shared/tv/types";

export type { EmZContent, Movie, TVShow, NextEpisodeToAir, Season, Provider, TMDBSearchMultiResponse, TMDBGenre, EmZGenre, WhoSelection, TMDBError };
export type { Content } from "@shared/tv/types";

export const whoOptions: WhoSelection[] = ["Emily", "Brian", "Both"];

export type Filter<T> = { name: string; filter: (items: T[]) => T[] };

export const fetchContentSearchResults = async (query: string) => {
  const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(
    query
  )}&include_adult=false&language=en-US&page=1`;

  const data: TMDBSearchMultiResponse = await fetchDataFromTMDB(url);

  return data;
};

export const fetchWatchProvidersSearchResults = async (query: string) => {
  const url = `https://api.themoviedb.org/3/watch/providers/tv`;
  const data = await fetchDataFromTMDB(url);
  const filteredData = data.results.filter((provider) => {
    return provider.provider_name.toLowerCase().includes(query.toLowerCase());
  });
  return filteredData;
};

export const fetchGenres = async () => {
  const movieUrl = "https://api.themoviedb.org/3/genre/movie/list";
  const movieData = await fetchDataFromTMDB(movieUrl);
  const movieGenres: TMDBGenre[] = movieData?.genres || [];

  const tvUrl = "https://api.themoviedb.org/3/genre/tv/list";
  const tvData = await fetchDataFromTMDB(tvUrl);
  const tvGenres: TMDBGenre[] = tvData?.genres || [];

  return [...movieGenres, ...tvGenres].reduce((prev: Record<number, EmZGenre>, curr) => {
    prev[curr.id] = {
      name: curr.name,
      color: `hsl(${(curr.id * 50) % 360}, 70%, 80%)`,
    };
    return prev;
  }, {});
};

export const fetchDataFromTMDB = async (url: string) => {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
    },
  };

  const res = await fetch(url, options).catch((err) => {
    console.error(err);
    return null;
  });

  if (!res) return null;

  if (!res.ok) {
    if (res.status === 429) {
      const err = new Error("Rate limit") as TMDBError;
      err.status = 429;
      throw err;
    }
    console.error(`TMDB error ${res.status}:`, await res.text());
    return null;
  }

  return res.json();
};

export const applyFilters = (
  rows: GridRowsProp,
  filters: Record<string, Filter<EmZContent>>
) => {
  let filteredRows: GridRowsProp = rows;
  for (const filter of Object.values(filters)) {
    filteredRows = filter.filter(filteredRows as EmZContent[]);
  }
  return filteredRows;
};

export const applyFiltersAndSorts = (
  rows: GridRowsProp,
  filters: Record<string, Filter<EmZContent>>
) => {
  const filteredRows = applyFilters(rows, filters);
  const sortedRows = Array.from(filteredRows as EmZContent[]).sort((a, b) => {
    const status = compareStatus(a, b);
    if (status === 0) {
      const ongoing = compareOngoing(a, b);
      if (ongoing === 0) {
        const releaseDate = compareReleaseDate(a, b);
        if (releaseDate === 0) {
          const progress = compareProgress(a, b);
          if (progress === 0) {
            return compareName(a, b);
          }
          return progress;
        } else {
          return releaseDate;
        }
      } else {
        return ongoing;
      }
    } else {
      return status;
    }
  });
  return sortedRows;
};

export const compareStatus = (a: EmZContent, b: EmZContent) => {
  const statusA =
    a.watched === 0
      ? "Not Started"
      : a.watched < a.episodes
      ? "In Progress"
      : "Completed";
  const statusB =
    b.watched === 0
      ? "Not Started"
      : b.watched < b.episodes
      ? "In Progress"
      : "Completed";
  if (statusA === statusB) {
    return 0;
  }

  if (statusA === "Completed") {
    return 1;
  }

  if (statusA === "Not Started" && statusB === "In Progress") {
    return 1;
  }

  return -1;
};

export const compareOngoing = (a: EmZContent, b: EmZContent) => {
  if (a.ongoing === b.ongoing) {
    return 0;
  }
  if (a.ongoing) {
    return -1;
  }
  return 1;
};

export const compareReleaseDate = (a: EmZContent, b: EmZContent) => {
  const dateA =
    a.media_type === "tv"
      ? a.next_episode_to_air
        ? new Date(a.next_episode_to_air.air_date)
        : null
      : new Date(a.release_date);
  const dateB =
    b.media_type === "tv"
      ? b.next_episode_to_air
        ? new Date(b.next_episode_to_air.air_date)
        : null
      : new Date(b.release_date);

  if (dateA === null && dateB === null) {
    return 0;
  }
  if (dateA === null) {
    return 1;
  }
  if (dateB === null) {
    return -1;
  }

  if (dateA < dateB) {
    return -1;
  }
  if (dateA > dateB) {
    return 1;
  }
  return 0;
};

export const compareProgress = (a: EmZContent, b: EmZContent) => {
  const progressA = (a.watched * 1.0) / a.episodes;
  const progressB = (b.watched * 1.0) / b.episodes;
  if (progressA === progressB) {
    return 0;
  }
  if (progressA < progressB) {
    return -1;
  }
  return 1;
};

export const compareName = (a: EmZContent, b: EmZContent) => {
  const nameA = a.media_type === "tv" ? a.name : a.title;
  const nameB = b.media_type === "tv" ? b.name : b.title;

  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
};
// export function filterToInterface<T>(obj: any, keys: (keyof T)[]): T {
//   const result: Partial<T> = {};
//   for (const key of keys) {
//     if (key in obj) {
//       result[key] = obj[key];
//     }
//   }
//   return result as T;
// }
