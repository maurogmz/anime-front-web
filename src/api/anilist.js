// Facade over the AniList GraphQL API: the only module that knows queries and field names.
// GraphQL lets one request carry several lists (aliases), which matters at 30 req/min.
import { createHttpClient, HttpError, messageFor } from "./httpClient.js";
import { toMedia, uniqueById } from "./mappers.js";
import { CATALOG, MEDIA_KINDS, PAGE_SIZE, SORTS, HIDDEN_GENRES, currentSeason } from "../config/catalog.js";

const ENDPOINT = "https://graphql.anilist.co";
const HOUR = 60 * 60 * 1000;

const http = createHttpClient();

const CARD = `
  id type format status averageScore seasonYear startDate { year }
  title { romaji english }
  coverImage { extraLarge large }
`;

const PAGE_INFO = "pageInfo { total currentPage lastPage hasNextPage }";

async function query(document, variables, { ttlMs } = {}) {
  const res = await http.requestJson(ENDPOINT, { body: JSON.stringify({ query: document, variables }), ttlMs });
  if (res?.errors?.length && !res.data) {
    const status = Number(res.errors[0]?.status) || 400;
    throw new HttpError(status, messageFor(status));
  }
  return res.data ?? {};
}

function assertKind(kind) {
  if (!MEDIA_KINDS.includes(kind)) throw new Error(`Unknown media kind: ${kind}`);
}

function assertId(id) {
  if (!Number.isInteger(id) || id <= 0) throw new Error(`Invalid id: ${id}`);
}

const items = (list) => uniqueById((list ?? []).map((m) => toMedia(m)));

function toPage(page) {
  const info = page?.pageInfo ?? {};
  return {
    items: items(page?.media),
    page: info.currentPage ?? 1,
    lastPage: Math.max(1, info.lastPage ?? 1),
    total: info.total ?? null,
  };
}

const SEARCH = `
  query Search($page: Int, $perPage: Int, $type: MediaType, $search: String, $format: MediaFormat,
               $status: MediaStatus, $genre: String, $sort: [MediaSort]) {
    Page(page: $page, perPage: $perPage) {
      ${PAGE_INFO}
      media(type: $type, search: $search, format: $format, status: $status, genre: $genre, sort: $sort, isAdult: false) { ${CARD} }
    }
  }`;

export async function searchMedia(kind, { q, format, status, genre, sort = "popular", page = 1 } = {}) {
  assertKind(kind);
  const order = (SORTS[sort] ?? SORTS.popular).sort;
  const data = await query(SEARCH, {
    page,
    perPage: PAGE_SIZE,
    type: CATALOG[kind].type,
    search: q || undefined,
    format: format || undefined,
    status: status || undefined,
    genre: genre || undefined,
    // A typed search ranks by relevance unless the user picked another order.
    sort: q && sort === "popular" ? ["SEARCH_MATCH", ...order] : order,
  });
  return toPage(data.Page);
}

const HOME = `
  query Home($season: MediaSeason, $year: Int, $perPage: Int) {
    season: Page(perPage: $perPage) {
      media(type: ANIME, season: $season, seasonYear: $year, sort: [POPULARITY_DESC], isAdult: false) {
        ${CARD} description(asHtml: false) episodes bannerImage studios(isMain: true) { nodes { name } }
      }
    }
    topAnime: Page(perPage: $perPage) { media(type: ANIME, sort: [SCORE_DESC], isAdult: false) { ${CARD} } }
    topManga: Page(perPage: $perPage) { media(type: MANGA, sort: [SCORE_DESC], isAdult: false) { ${CARD} } }
  }`;

/** Everything the home page needs, in one request. */
export async function getHome({ perPage = 16, date } = {}) {
  const { season, year } = currentSeason(date);
  const data = await query(HOME, { season, year, perPage }, { ttlMs: HOUR });
  return {
    season: items(data.season?.media),
    topAnime: items(data.topAnime?.media),
    topManga: items(data.topManga?.media),
  };
}

const DETAIL = `
  query Detail($id: Int, $type: MediaType) {
    Media(id: $id, type: $type, isAdult: false) {
      ${CARD}
      title { romaji english native }
      coverImage { extraLarge large color }
      bannerImage description(asHtml: false) siteUrl
      episodes duration chapters volumes popularity favourites genres
      startDate { year month day } endDate { year month day }
      rankings { rank type allTime }
      trailer { id site }
      studios(isMain: true) { nodes { name } }
      staff(perPage: 6, sort: [RELEVANCE]) { edges { role node { name { full } } } }
      recommendations(perPage: 15, sort: [RATING_DESC]) {
        nodes { mediaRecommendation { ${CARD} } }
      }
    }
  }`;

/** Detail with recommendations included: one request per page view. */
export async function getMedia(kind, id) {
  assertKind(kind);
  assertId(id);
  const data = await query(DETAIL, { id, type: CATALOG[kind].type }, { ttlMs: HOUR });
  if (!data.Media) throw new HttpError(404, messageFor(404));
  return toMedia(data.Media, kind);
}

export async function getGenres() {
  const data = await query("query { GenreCollection }", {}, { ttlMs: 24 * HOUR });
  return (data.GenreCollection ?? []).filter((g) => typeof g === "string" && !HIDDEN_GENRES.has(g));
}

const BY_MAL = `
  query ByMal($ids: [Int], $type: MediaType) {
    Page(perPage: 50) { media(idMal_in: $ids, type: $type) { ${CARD} } }
  }`;

/** Maps legacy MyAnimeList ids (v1 favorites) to AniList entries. */
export async function getAnimeByMalIds(malIds) {
  const ids = malIds.filter((id) => Number.isInteger(id) && id > 0).slice(0, 50);
  if (!ids.length) return [];
  const data = await query(BY_MAL, { ids, type: "ANIME" }, { ttlMs: HOUR });
  return items(data.Page?.media);
}
