// Filter options per media kind. Values are the exact Jikan v4 query values;
// anything outside these lists is rejected before it reaches the API.

export const MEDIA_KINDS = ["anime", "manga"];

export const CATALOG = {
  anime: {
    label: "Anime",
    unit: "episodes",
    formats: [
      ["tv", "TV"],
      ["movie", "Movie"],
      ["ova", "OVA"],
      ["ona", "ONA"],
      ["special", "Special"],
      ["music", "Music"],
    ],
    statuses: [
      ["airing", "Airing"],
      ["complete", "Finished"],
      ["upcoming", "Upcoming"],
    ],
  },
  manga: {
    label: "Manga",
    unit: "chapters",
    formats: [
      ["manga", "Manga"],
      ["manhwa", "Manhwa"],
      ["manhua", "Manhua"],
      ["novel", "Novel"],
      ["lightnovel", "Light novel"],
      ["oneshot", "One-shot"],
    ],
    statuses: [
      ["publishing", "Publishing"],
      ["complete", "Finished"],
      ["hiatus", "On hiatus"],
      ["discontinued", "Discontinued"],
      ["upcoming", "Upcoming"],
    ],
  },
};

// Sort key → Jikan order_by + sort.
export const SORTS = {
  popular: { label: "Most popular", order_by: "members", sort: "desc" },
  score: { label: "Highest score", order_by: "score", sort: "desc" },
  newest: { label: "Newest", order_by: "start_date", sort: "desc" },
  title: { label: "Title A–Z", order_by: "title", sort: "asc" },
};

export const PAGE_SIZE = 24; // Jikan max is 25

const MAX_QUERY = 100;
const MAX_PAGE = 2000;

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
    genre: /^\d{1,5}$/.test(genre) ? genre : "",
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
