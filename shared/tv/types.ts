

export class ContentStatus {
  private constructor(
    public readonly name: string,
    public readonly order: number,) {}

    static readonly IN_PROGRESS = new ContentStatus('In Progress', 0);
    static readonly CAUGHT_UP = new ContentStatus('Caught Up', 1);
    static readonly NOT_STARTED = new ContentStatus('Not Started', 2);
    static readonly COMPLETED = new ContentStatus('Completed', 3);

    static calculate(content: EmZContent): ContentStatus {
      if (content.override_as_complete) {
        return ContentStatus.COMPLETED;
      }

      const totalEpisodes = content.episodes;
      const ongoing = content.ongoing;

      if (content.watched >= totalEpisodes && !ongoing) {
        return ContentStatus.COMPLETED;
      }

      const airedCount = ContentStatus.getAiredCount(content);
      if (content.watched >= airedCount) {
        return ContentStatus.CAUGHT_UP;
      }

      if (content.watched === 0) {
        return ContentStatus.NOT_STARTED;
      }

      return ContentStatus.IN_PROGRESS;
    }

    static getAiredCount(content: EmZContent): number {
      if (content.media_type === "movie") return 1;
      if (!content.last_episode_to_air) return 0;

      const last = content.next_episode_to_air != null && new Date(content.next_episode_to_air.air_date) <= new Date() ? content.next_episode_to_air : content.last_episode_to_air;
      const previousSeasonsCount = (content.seasons || [])
        .filter((s) => s.season_number > 0 && s.season_number < last.season_number)
        .reduce((acc, s) => acc + s.episode_count, 0);
      return previousSeasonsCount + last.episode_number;
    }

    static compare(a: ContentStatus, b: ContentStatus): number {
      return a.order - b.order;
    }
}

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
  last_episode_to_air: NextEpisodeToAir;
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
  override_as_complete: boolean;
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
