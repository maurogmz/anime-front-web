// Facade over Jikan v4: the only module that knows endpoint paths and query names.
import { createHttpClient } from "./httpClient.js";
import { toMedia, toRecommendation, toGenre, uniqueById } from "./mappers.js";
import { MEDIA_KINDS, PAGE_SIZE, SORTS } from "../config/catalog.js";

const BASE = "https://api.jikan.moe/v4";
const HOUR = 60 * 60 * 1000;

const http = createHttpClient();

function endpoint(path, params = {}) {
  const url = new URL(BASE + path);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
  }
  return url.toString();
}

function assertKind(kind) {
  if (!MEDIA_KINDS.includes(kind)) throw new Error(`Unknown media kind: ${kind}`);
}

function assertId(id) {
  if (!Number.isInteger(id) || id <= 0) throw new Error(`Invalid id: ${id}`);
}

function toPage(res, kind) {
  const p = res.pagination ?? {};
  return {
    items: uniqueById((res.data ?? []).map((raw) => toMedia(raw, kind))),
    page: p.current_page ?? 1,
    lastPage: Math.max(1, p.last_visible_page ?? 1),
    total: p.items?.total ?? null,
  };
}

export async function searchMedia(kind, { q, format, status, genre, sort = "popular", page = 1 } = {}) {
  assertKind(kind);
  const order = SORTS[sort] ?? SORTS.popular;
  const res = await http.getJson(
    endpoint(`/${kind}`, {
      q,
      type: format,
      status,
      genres: genre,
      order_by: order.order_by,
      sort: order.sort,
      page,
      limit: PAGE_SIZE,
      sfw: "true",
    }),
  );
  return toPage(res, kind);
}

export async function getTop(kind, { limit = 15 } = {}) {
  assertKind(kind);
  const res = await http.getJson(endpoint(`/top/${kind}`, { limit, sfw: "true" }), { ttlMs: HOUR });
  return toPage(res, kind);
}

export async function getSeasonNow({ limit = 15 } = {}) {
  const res = await http.getJson(endpoint("/seasons/now", { limit, sfw: "true" }), { ttlMs: HOUR });
  return toPage(res, "anime");
}

export async function getMedia(kind, id) {
  assertKind(kind);
  assertId(id);
  const res = await http.getJson(endpoint(`/${kind}/${id}/full`), { ttlMs: HOUR });
  return toMedia(res.data, kind);
}

export async function getRecommendations(kind, id) {
  assertKind(kind);
  assertId(id);
  const res = await http.getJson(endpoint(`/${kind}/${id}/recommendations`), { ttlMs: HOUR });
  return uniqueById((res.data ?? []).map(toRecommendation));
}

export async function getGenres(kind) {
  assertKind(kind);
  const res = await http.getJson(endpoint(`/genres/${kind}`, { filter: "genres" }), { ttlMs: 24 * HOUR });
  return (res.data ?? []).map(toGenre).sort((a, b) => a.name.localeCompare(b.name));
}
