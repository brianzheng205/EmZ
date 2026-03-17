import {
  mapTvData,
  mapMovieData,
  findNewCollectionMovies,
} from "../../shared/tv/functions";

// ---------------------------------------------------------------------------
// mapTvData
// ---------------------------------------------------------------------------

describe("mapTvData", () => {
  const baseDocData: Record<string, unknown> = {
    id: 1399,
    media_type: "tv",
    who: "Emily",
    watched: 4,
  };

  const tmdbTvResponse = {
    original_name: "Game of Thrones",
    name: "Game of Thrones",
    next_episode_to_air: null,
    last_episode_to_air: { season_number: 1, episode_number: 10 },
    seasons: [
      { id: 1, season_number: 1, episode_count: 10, name: "Season 1", air_date: "2011-04-17", overview: "", poster_path: "/season.jpg", vote_average: 8 }
    ],
    "watch/providers": { results: { US: { flatrate: [{ provider_id: 1, provider_name: "HBO", logo_path: "/hbo.jpg", display_priority: 1 }], link: "https://www.themoviedb.org/tv/1399/watch" } } },
    number_of_episodes: 73,
    in_production: false,
    adult: false,
    backdrop_path: "/backdrop.jpg",
    genres: [{ id: 18, name: "Drama" }, { id: 10765, name: "Sci-Fi" }],
    original_language: "en",
    overview: "Seven noble families...",
    popularity: 369.594,
    poster_path: "/poster.jpg",
    vote_average: 8.4,
    vote_count: 21000,
  };

  it("maps all expected fields from the TMDB response", () => {
    const result = mapTvData(baseDocData, tmdbTvResponse);
    expect(result.original_name).toBe("Game of Thrones");
    expect(result.name).toBe("Game of Thrones");
    expect(result.next_episode_to_air).toBeNull();
    expect(result.last_episode_to_air).toEqual({ season_number: 1, episode_number: 10 });
    expect(result.seasons).toHaveLength(1);
    expect(result.episodes).toBe(73);
    expect(result.ongoing).toBe(false);
    expect(result.adult).toBe(false);
    expect(result.genre_ids).toEqual([18, 10765]);
    expect(result.original_language).toBe("en");
    expect(result.popularity).toBe(369.594);
    expect(result.vote_average).toBe(8.4);
    expect(result.vote_count).toBe(21000);
  });

  it("preserves original doc fields (who, watched) that TMDB doesn't know about", () => {
    const result = mapTvData(baseDocData, tmdbTvResponse);
    expect(result.who).toBe("Emily");
    expect(result.watched).toBe(4);
    expect(result.id).toBe(1399);
  });

  it("maps watch_providers from US results", () => {
    const result = mapTvData(baseDocData, tmdbTvResponse);
    expect(result.watch_providers).toMatchObject({
      flatrate: [expect.objectContaining({ provider_name: "HBO" })],
    });
  });

  it("falls back to empty array when US watch providers are missing", () => {
    const noProviders = { ...tmdbTvResponse, "watch/providers": { results: {} } };
    const result = mapTvData(baseDocData, noProviders);
    expect(result.watch_providers).toEqual([]);
  });

  it("falls back to empty array for seasons when missing", () => {
    const noSeasons = { ...tmdbTvResponse, seasons: undefined };
    const result = mapTvData(baseDocData, noSeasons);
    expect(result.seasons).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// mapMovieData
// ---------------------------------------------------------------------------

describe("mapMovieData", () => {
  const baseDocData: Record<string, unknown> = {
    id: 603,
    media_type: "movie",
    who: "Brian",
    watched: 1,
  };

  const tmdbMovieResponse = {
    adult: false,
    backdrop_path: "/backdrop.jpg",
    genres: [{ id: 28, name: "Action" }],
    overview: "A computer hacker...",
    popularity: 100,
    poster_path: "/poster.jpg",
    vote_average: 8.7,
    vote_count: 24000,
    original_title: "The Matrix",
    release_date: "1999-03-31",
    title: "The Matrix",
    video: false,
    "watch/providers": { results: { US: { flatrate: [], link: "" } } },
    belongs_to_collection: { id: 2344, name: "The Matrix Collection" },
  };

  it("maps all expected fields from the TMDB response", () => {
    const { data } = mapMovieData(baseDocData, tmdbMovieResponse);
    expect(data.title).toBe("The Matrix");
    expect(data.original_title).toBe("The Matrix");
    expect(data.release_date).toBe("1999-03-31");
    expect(data.genre_ids).toEqual([28]);
    expect(data.episodes).toBe(1);
    expect(data.ongoing).toBe(false);
    expect(data.vote_average).toBe(8.7);
  });

  it("preserves original doc fields (who, watched)", () => {
    const { data } = mapMovieData(baseDocData, tmdbMovieResponse);
    expect(data.who).toBe("Brian");
    expect(data.watched).toBe(1);
    expect(data.id).toBe(603);
  });

  it("returns a CollectionRef when belongs_to_collection is present", () => {
    const { collection } = mapMovieData(baseDocData, tmdbMovieResponse);
    expect(collection).not.toBeNull();
    expect(collection?.id).toBe(2344);
    expect(collection?.who).toBe("Brian");
  });

  it("returns null collection when belongs_to_collection is absent", () => {
    const standalone = { ...tmdbMovieResponse, belongs_to_collection: null };
    const { collection } = mapMovieData(baseDocData, standalone);
    expect(collection).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// findNewCollectionMovies
// ---------------------------------------------------------------------------

describe("findNewCollectionMovies", () => {
  it("returns IDs not already tracked", () => {
    const trackedIds = new Set([603, 604]);
    const collectionMovies = [
      { id: 603 }, // already tracked
      { id: 604 }, // already tracked
      { id: 605 }, // NEW
    ];
    expect(findNewCollectionMovies(trackedIds, collectionMovies)).toEqual([605]);
  });

  it("returns empty array when all collection movies are already tracked", () => {
    const trackedIds = new Set([603, 604, 605]);
    const collectionMovies = [{ id: 603 }, { id: 604 }, { id: 605 }];
    expect(findNewCollectionMovies(trackedIds, collectionMovies)).toEqual([]);
  });

  it("returns all IDs when none are tracked", () => {
    const trackedIds = new Set<number>();
    const collectionMovies = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(findNewCollectionMovies(trackedIds, collectionMovies)).toEqual([1, 2, 3]);
  });

  it("returns empty array for an empty collection", () => {
    const trackedIds = new Set([1, 2]);
    expect(findNewCollectionMovies(trackedIds, [])).toEqual([]);
  });
});
