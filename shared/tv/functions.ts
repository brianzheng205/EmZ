import {
  TMDBGenre,
  WatchProviderResult,
  WhoSelection,
} from "./types";

export interface CollectionRef {
  id: number;
  who: WhoSelection;
}

export const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Given the set of TMDB movie IDs already tracked in Firestore and the list of
 * movies in a TMDB collection, return the IDs of movies not yet tracked.
 */
export const findNewCollectionMovies = (
  trackedIds: Set<number>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collectionMovies: any[]
): number[] => {
  return collectionMovies
    .map((m) => m.id as number)
    .filter((id) => !trackedIds.has(id));
};

/**
 * Map a raw TMDB TV response onto Firestore document fields.
 */
export const mapTvData = (
  docData: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tmdbData: any
): Record<string, unknown> => {
  return {
    ...docData,
    original_name: tmdbData.original_name,
    name: tmdbData.name,
    next_episode_to_air: tmdbData.next_episode_to_air ?? null,
    last_episode_to_air: tmdbData.last_episode_to_air ?? null,
    seasons: tmdbData.seasons ?? [],
    watch_providers:
      (tmdbData["watch/providers"]?.results?.US as WatchProviderResult) ?? [],
    episodes: tmdbData.number_of_episodes,
    ongoing: tmdbData.in_production,
    adult: tmdbData.adult,
    backdrop_path: tmdbData.backdrop_path,
    genre_ids: (tmdbData.genres as TMDBGenre[]).map((g) => g.id),
    original_language: tmdbData.original_language,
    overview: tmdbData.overview,
    popularity: tmdbData.popularity,
    poster_path: tmdbData.poster_path,
    vote_average: tmdbData.vote_average,
    vote_count: tmdbData.vote_count,
  };
};

/**
 * Map a raw TMDB Movie response onto Firestore document fields.
 * Also returns any franchise collection reference found on the movie.
 */
export const mapMovieData = (
  docData: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tmdbData: any
): { data: Record<string, unknown>; collection: CollectionRef | null } => {
  const collection: CollectionRef | null = tmdbData.belongs_to_collection
    ? {
        id: tmdbData.belongs_to_collection.id as number,
        who: (docData.who as WhoSelection) ?? "Both",
      }
    : null;

  return {
    data: {
      ...docData,
      adult: tmdbData.adult,
      backdrop_path: tmdbData.backdrop_path,
      genre_ids: (tmdbData.genres as TMDBGenre[]).map((g) => g.id),
      overview: tmdbData.overview,
      popularity: tmdbData.popularity,
      poster_path: tmdbData.poster_path,
      vote_average: tmdbData.vote_average,
      vote_count: tmdbData.vote_count,
      episodes: 1,
      next_episode_to_air: null,
      last_episode_to_air: null,
      ongoing: false,
      original_title: tmdbData.original_title,
      release_date: tmdbData.release_date,
      title: tmdbData.title,
      video: tmdbData.video,
      watch_providers:
        (tmdbData["watch/providers"]?.results?.US as WatchProviderResult) ?? [],
    },
    collection,
  };
};

/** Maximum number of concurrent TMDB requests in a single batch. */
export const BATCH_SIZE = 40;
/** Delay (ms) between batches. */
export const BATCH_DELAY_MS = 2000;
/** Max retry attempts when a 429 (rate limit) is hit. */
export const MAX_RETRY_ATTEMPTS = 5;
/** Base back-off delay (ms) before retrying after a 429. */
export const RETRY_BASE_DELAY_MS = 1000;

/**
 * Fetch a single TMDB URL with retry logic for 429 rate-limit responses.
 */
export const fetchFromTMDB = async (
  url: string,
  apiKey: string
): Promise<any> => {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  };

  let attempts = 0;

  while (attempts < MAX_RETRY_ATTEMPTS) {
    const res = await fetch(url, options).catch((err: Error) => {
      console.error("Network error fetching from TMDB:", err);
      return null;
    });

    if (!res) return null;
    if (res.ok) return res.json();

    if (res.status === 429) {
      attempts++;
      const waitMs = RETRY_BASE_DELAY_MS * attempts;
      console.warn(
        `TMDB rate limit hit for ${url}. Retrying in ${waitMs}ms (attempt ${attempts}/${MAX_RETRY_ATTEMPTS})`
      );
      await delay(waitMs);
      continue;
    }

    console.error(`TMDB error ${res.status} for ${url}:`, await res.text());
    return null;
  }

  console.error(
    `Exhausted retries for ${url} after ${MAX_RETRY_ATTEMPTS} attempts.`
  );
  return null;
};

/**
 * Process a single Firestore document: fetch its latest data from TMDB.
 * Returns the updated data and any discovered collection reference.
 */
export const updateDocument = async (
  docData: any,
  apiKey: string,
  saveDoc?: (id: string, data: any) => Promise<void>
): Promise<{ updatedData: any; collection: CollectionRef | null } | null> => {
  const isTv = docData.media_type === "tv";
  const id = docData.id as number;

  const url = isTv
    ? `https://api.themoviedb.org/3/tv/${id}?append_to_response=watch%2Fproviders&language=en-US`
    : `https://api.themoviedb.org/3/movie/${id}?append_to_response=watch%2Fproviders&language=en-US`;

  try {
    const tmdbData = await fetchFromTMDB(url, apiKey);

    if (!tmdbData) {
      console.warn(`No TMDB data returned for ${isTv ? "TV" : "movie"} id=${id}`);
      return null;
    }

    let updatedData: any;
    let collection: CollectionRef | null = null;

    if (isTv) {
      updatedData = mapTvData(docData, tmdbData);
    } else {
      const result = mapMovieData(docData, tmdbData);
      updatedData = result.data;
      collection = result.collection;
    }

    if (saveDoc) {
      await saveDoc(String(id), updatedData);
    }

    return { updatedData, collection };
  } catch (err: any) {
    console.error(
      `Unexpected error updating ${isTv ? "TV" : "movie"} id=${id}:`,
      err.message
    );
    return null;
  }
};

/**
 * Fetch the TMDB collection, find any movies not yet in Firestore, and add them.
 */
export const addNewCollectionMovies = async (
  collectionRef: CollectionRef,
  trackedIds: Set<number>,
  apiKey: string,
  saveDoc: (id: string, data: any) => Promise<void>,
  onNewDoc?: (data: any) => void
): Promise<number> => {
  const collectionData = (await fetchFromTMDB(
    `https://api.themoviedb.org/3/collection/${collectionRef.id}`,
    apiKey
  )) as any;

  if (!collectionData?.parts) return 0;

  const newIds = findNewCollectionMovies(trackedIds, collectionData.parts);
  if (newIds.length === 0) return 0;

  console.log(
    `Collection ${collectionRef.id}: found ${newIds.length} new movie(s) to add: [${newIds.join(", ")}]`
  );

  let added = 0;

  for (let batchStart = 0; batchStart < newIds.length; batchStart += BATCH_SIZE) {
    const batchIds = newIds.slice(batchStart, batchStart + BATCH_SIZE);

    const results = await Promise.allSettled(
      batchIds.map(async (movieId) => {
        const movieData = (await fetchFromTMDB(
          `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=watch%2Fproviders&language=en-US`,
          apiKey
        )) as any;

        if (!movieData) {
          console.warn(`No data returned from TMDB for new movie id=${movieId}`);
          return false;
        }

        const baseDoc: Record<string, unknown> = {
          who: collectionRef.who,
          watched: 0,
          media_type: "movie",
        };

        const { data: newDocData } = mapMovieData(baseDoc, movieData);
        await saveDoc(String(movieId), newDocData);
        if (onNewDoc) onNewDoc(newDocData);

        trackedIds.add(movieId);
        return true;
      })
    );

    added += results.filter(
      (r) => r.status === "fulfilled" && r.value === true
    ).length;

    if (batchStart + BATCH_SIZE < newIds.length) {
      await delay(BATCH_DELAY_MS);
    }
  }

  return added;
};

export const fetchContentUpdatesFromTMDB = async (
  docsToUpdate: any[],
  apiKey: string,
  saveDoc: (id: string, data: any) => Promise<void>,
  onDocUpdated?: (id: number, data: any) => void,
  onNewDoc?: (data: any) => void
) => {
    const startTime = Date.now();
    console.log("fetchContentUpdatesFromTMDB: starting refresh");

    if (!apiKey) {
      console.error("TMDB_API_KEY is not provided. Aborting.");
      return;
    }

    console.log(
      `fetchContentUpdatesFromTMDB: refreshing ${docsToUpdate.length} documents`
    );

    // Track all known IDs so franchise detection can diff against them
    const trackedIds = new Set<number>(
      docsToUpdate.map((d) => d.id as number)
    );

    let updateSuccessCount = 0;
    let updateFailureCount = 0;

    // Map from TMDB collection ID → who value inherited from the tracked sibling
    const collectionsToCheck = new Map<number, WhoSelection>();

    // --- Pass 1: Update all existing documents ---
    for (
      let batchStart = 0;
      batchStart < docsToUpdate.length;
      batchStart += BATCH_SIZE
    ) {
      const batchDocs = docsToUpdate.slice(batchStart, batchStart + BATCH_SIZE);
      const batchNumber = Math.floor(batchStart / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(docsToUpdate.length / BATCH_SIZE);

      console.log(
        `fetchContentUpdatesFromTMDB: updating batch ${batchNumber}/${totalBatches} ` +
          `(docs ${batchStart + 1}–${batchStart + batchDocs.length})`
      );

      const results = await Promise.allSettled(
        batchDocs.map(async (docData) => {
           const result = await updateDocument(docData, apiKey, saveDoc);
           if (result && onDocUpdated) {
             onDocUpdated(docData.id, result.updatedData);
           }
           return result?.collection;
        })
      );

      for (const result of results) {
        if (result.status === "fulfilled") {
          updateSuccessCount++;
          // Collect any franchise collection refs discovered
          if (result.value) {
            const { id, who } = result.value;
            if (!collectionsToCheck.has(id)) {
              collectionsToCheck.set(id, who);
            }
          }
        } else {
          updateFailureCount++;
        }
      }

      if (batchStart + BATCH_SIZE < docsToUpdate.length) {
        await delay(BATCH_DELAY_MS);
      }
    }

    console.log(
      `fetchContentUpdatesFromTMDB: updates done — ` +
        `${updateSuccessCount} updated, ${updateFailureCount} failed. ` +
        `${collectionsToCheck.size} franchise collection(s) to check.`
    );

    // --- Pass 2: Find and add new franchise movies ---
    let totalNewMovies = 0;

    for (const [collectionId, who] of collectionsToCheck) {
      const newCount = await addNewCollectionMovies(
        { id: collectionId, who },
        trackedIds,
        apiKey,
        saveDoc,
        onNewDoc
      );
      totalNewMovies += newCount;
      // Small pause between collection fetches to be polite to TMDB
      await delay(500);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      `fetchContentUpdatesFromTMDB: finished in ${elapsed}s — ` +
        `${updateSuccessCount} updated, ${updateFailureCount} failed, ` +
        `${totalNewMovies} new franchise movie(s) added`
    );
  }
