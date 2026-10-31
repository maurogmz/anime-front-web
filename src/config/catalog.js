// Filter options per media kind. Values are exact AniList GraphQL enum values;
// anything outside these lists is rejected before it reaches the API.

export const MEDIA_KINDS = ["anime", "manga"];

export const CATALOG = {
  anime: {
    label: "Anime",
    type: "ANIME",
    formats: [
      ["TV", "TV"],
      ["TV_SHORT", "TV short"],
      ["MOVIE", "Movie"],
      ["OVA", "OVA"],
      ["ONA", "ONA"],
      ["SPECIAL", "Special"],
      ["MUSIC", "Music"],
    ],
    statuses: [
      ["RELEASING", "Airing"],
      ["FINISHED", "Finished"],
      ["NOT_YET_RELEASED", "Upcoming"],
    ],
  },
  manga: {
    label: "Manga",
    type: "MANGA",
    formats: [
      ["MANGA", "Manga"],
      ["NOVEL", "Light novel"],
      ["ONE_SHOT", "One-shot"],
    ],
    statuses: [
      ["RELEASING", "Publishing"],
      ["FINISHED", "Finished"],
      ["HIATUS", "On hiatus"],
      ["CANCELLED", "Cancelled"],
      ["NOT_YET_RELEASED", "Upcoming"],
    ],
  },
};

// Sort key → AniList MediaSort list. With a search term, relevance goes first.
export const SORTS = {
  popular: { label: "Most popular", sort: ["POPULARITY_DESC"] },
  score: { label: "Highest score", sort: ["SCORE_DESC"] },
  newest: { label: "Newest", sort: ["START_DATE_DESC"] },
  title: { label: "Title A–Z", sort: ["TITLE_ROMAJI"] },
};

export const PAGE_SIZE = 24; // AniList max perPage is 50

// AniList genres are free strings; adult genres are excluded on purpose.
export const HIDDEN_GENRES = new Set(["Hentai"]);

const MAX_QUERY = 100;
const MAX_PAGE = 500;

/** Human label for an AniList enum value (format or status), per kind. */
export function labelOf(kind, value) {
  const config = CATALOG[kind];
  const found = [...config.formats, ...config.statuses].find(([v]) => v === value);
  return found ? found[1] : "";
}

/** Whitelists browse params coming from the URL. Unknown values are dropped. */
export function sanitizeBrowseParams(kind, params) {
  const config = CATALOG[kind];
  const get = (k) => (params.get(k) ?? "").trim();
  const oneOf = (value, options) => (options.some(([v]) => v === value) ? value : "");

  const page = Number.parseInt(get("page"), 10);
  const genre = get("genre");

  return {
    q: get("q").slice(0, MAX_QUERY),
    format: oneOf(get("format"), config.formats),
    status: oneOf(get("status"), config.statuses),
    genre: /^[A-Za-z][A-Za-z -]{0,29}$/.test(genre) && !HIDDEN_GENRES.has(genre) ? genre : "",
    sort: Object.hasOwn(SORTS, get("sort")) ? get("sort") : "popular",
    page: Number.isInteger(page) && page > 0 ? Math.min(page, MAX_PAGE) : 1,
  };
}

/** Inverse of sanitizeBrowseParams: only non-default values go in the URL. */
export function browseQuery(filters) {
  const out = new URLSearchParams();
  if (filters.q) out.set("q", filters.q);
  if (filters.format) out.set("format", filters.format);
  if (filters.status) out.set("status", filters.status);
  if (filters.genre) out.set("genre", filters.genre);
  if (filters.sort && filters.sort !== "popular") out.set("sort", filters.sort);
  if (filters.page > 1) out.set("page", String(filters.page));
  const qs = out.toString();
  return qs ? `?${qs}` : "";
}

/** AniList seasons: WINTER = Jan–Mar, SPRING = Apr–Jun, SUMMER = Jul–Sep, FALL = Oct–Dec. */
export function currentSeason(date = new Date()) {
  const seasons = ["WINTER", "SPRING", "SUMMER", "FALL"];
  return { season: seasons[Math.floor(date.getMonth() / 3)], year: date.getFullYear() };
}
