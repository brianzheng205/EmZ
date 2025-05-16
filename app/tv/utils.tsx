export interface Content {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  overview: string;
  popularity: number;
  poster_path: string;
  vote_average: number;
  vote_count: number;
  media_type?: string;
}

export interface EmZContent extends Movie, TVShow {
  who: WhoSelection;
  watched: number;
  episodes: number;
  ongoing: boolean;
}

export interface TVShow extends Content {
  origin_country: string[];
  original_name: string;
  first_air_date: string;
  name: string;
}

export interface Movie extends Content {
  original_title: string;
  release_date: string;
  title: string;
  video: boolean;
}

export type TMDBSearchMultiResponse = {
  page: number;
  results: Content[];
  total_pages: number;
  total_results: number;
};

export type TMDBGenre = {
  id: number;
  name: string;
};

export type WhoSelection = "Emily" | "Brian" | "Both";
export const whoOptions: WhoSelection[] = ["Emily", "Brian", "Both"];

export const fetchSearchResults = async (query: string) => {
  const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(
    query
  )}&include_adult=false&language=en-US&page=1`;

  const data: TMDBSearchMultiResponse = await fetchDataFromTMDB(url);

  return data;
};

export const fetchGenres = async () => {
  const movieUrl = "https://api.themoviedb.org/3/genre/movie/list";

  const movieGenres: TMDBGenre[] = await fetchDataFromTMDB(movieUrl).then(
    (res) => res.genres
  );

  const tvUrl = "https://api.themoviedb.org/3/genre/tv/list";

  const tvGenres: TMDBGenre[] = await fetchDataFromTMDB(tvUrl).then(
    (res) => res.genres
  );

  return [...movieGenres, ...tvGenres].reduce((prev, curr) => {
    prev[curr.id] = curr.name;
    return prev;
  });
};

export const fetchDataFromTMDB = async (url: string) => {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
    },
  };

  const data = await fetch(url, options)
    .then((res) => res.json())
    .catch((err) => console.error(err));

  return data;
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
