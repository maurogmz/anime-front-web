// Adapter: turns raw Jikan payloads into the app's own Media shape, so the UI never
// depends on API field names and every URL is validated once, here.
import { safeUrl } from "../lib/url.js";

const MAL_CREDIT = /\s*\[Written by MAL Rewrite\]\s*$/;

const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const named = (list) =>
  (Array.isArray(list) ? list : [])
    .filter((x) => Number.isInteger(x?.mal_id) && typeof x?.name === "string")
    .map((x) => ({ id: x.mal_id, name: x.name }));

function yearOf(raw) {
  if (num(raw.year)) return raw.year;
  const from = raw.aired?.from ?? raw.published?.from;
  const y = from ? new Date(from).getUTCFullYear() : NaN;
  return Number.isFinite(y) ? y : null;
}

export function toMedia(raw, kind) {
  const img = raw.images?.webp ?? raw.images?.jpg ?? {};
  const fallback = raw.images?.jpg ?? {};
  const english = raw.title_english || "";
  const main = raw.title || english || "Untitled";

  return {
    id: raw.mal_id,
    kind,
    title: english || main,
    altTitle: english && english !== main ? main : "",
    titleJapanese: raw.title_japanese ?? "",
    image: safeUrl(img.large_image_url) || safeUrl(fallback.large_image_url) || safeUrl(img.image_url),
    format: raw.type ?? "",
    status: raw.status ?? "",
    score: num(raw.score),
    scoredBy: num(raw.scored_by),
    rank: num(raw.rank),
    popularity: num(raw.popularity),
    members: num(raw.members),
    year: yearOf(raw),
    season: raw.season ?? "",
    episodes: num(raw.episodes),
    chapters: num(raw.chapters),
    volumes: num(raw.volumes),
    duration: raw.duration ?? "",
    rating: raw.rating ?? "",
    period: raw.aired?.string ?? raw.published?.string ?? "",
    synopsis: (raw.synopsis ?? "").replace(MAL_CREDIT, "").trim(),
    genres: [...named(raw.genres), ...named(raw.themes), ...named(raw.demographics)],
    creators: named(kind === "anime" ? raw.studios : raw.authors),
    trailerUrl: safeUrl(raw.trailer?.url),
    url: safeUrl(raw.url),
  };
}

export function toRecommendation(raw) {
  const entry = raw.entry ?? {};
  const img = entry.images?.webp ?? entry.images?.jpg ?? {};
  return {
    id: entry.mal_id,
    title: entry.title ?? "Untitled",
    image: safeUrl(img.large_image_url) || safeUrl(img.image_url),
    votes: num(raw.votes),
  };
}

export function toGenre(raw) {
  return { id: raw.mal_id, name: raw.name, count: num(raw.count) };
}

/** Jikan occasionally repeats entries across a page (notably /seasons/now). */
export function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => Number.isInteger(item.id) && !seen.has(item.id) && seen.add(item.id));
}
