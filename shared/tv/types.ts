export type WhoSelection = "Emily" | "Brian" | "Both";

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

export interface NextEpisodeToAir {
  air_date: string;
  episode_number: number;
  episode_type: string;
  id: number;
  name: string;
  overview: string;
  production_code: string;
  season_number: number;
  show_id: number;
  still_path: string;
  vote_average: number;
  vote_count: number;
}

export interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  vote_average: number;
}

export interface Provider {
  provider_id: number;
  logo_path: string;
  provider_name: string;
  display_priority: number;
}

export interface WatchProviderResult {
  buy?: Provider[];
  flatrate?: Provider[];
  rent?: Provider[];
  free?: Provider[];
  ads?: Provider[];
  link: string;
}

export interface TVShow extends Content {
  origin_country: string[];
  original_name: string;
  first_air_date: string;
  name: string;
  next_episode_to_air: NextEpisodeToAir;
  seasons: Season[];
  watch_providers: WatchProviderResult;
}

export interface Movie extends Content {
  original_title: string;
  release_date: string;
  title: string;
  video: boolean;
  watch_providers: WatchProviderResult;
}

export interface EmZContent extends Movie, TVShow {
  who: WhoSelection;
  watched: number;
  episodes: number;
  ongoing: boolean;
  watched_name?: string | null;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface EmZGenre {
  name: string;
  color: string;
}

export interface TMDBSearchMultiResponse {
  page: number;
  results: Content[];
  total_pages: number;
  total_results: number;
}

export interface TMDBError extends Error {
  status?: number;
}
