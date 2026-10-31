// Adapter: turns raw AniList payloads into the app's own Media shape, so the UI never
// depends on API field names and every URL and HTML fragment is cleaned once, here.
import { safeUrl } from "../lib/url.js";
import { labelOf } from "../config/catalog.js";

const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const str = (v) => (typeof v === "string" ? v : "");

/**
 * AniList descriptions contain light HTML (<br>, <i>, entities). Parse it in an inert
 * document (scripts never run, nothing is attached to the page) and keep the text only.
 */
export function htmlToText(html) {
  if (!html) return "";
  const withBreaks = str(html).replace(/<br\s*\/?>/gi, "\n");
  const text = new DOMParser().parseFromString(withBreaks, "text/html").body.textContent ?? "";
  return text
    .replace(/\(Source:[^)]*\)\s*$/i, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function trailerUrl(trailer) {
  const id = str(trailer?.id);
  if (!/^[\w-]{5,20}$/.test(id)) return "";
  if (trailer.site === "youtube") return `https://www.youtube.com/watch?v=${id}`;
  if (trailer.site === "dailymotion") return `https://www.dailymotion.com/video/${id}`;
  return "";
}

function rankOf(rankings, type) {
  const hit = (rankings ?? []).find((r) => r?.type === type && r?.allTime);
  return num(hit?.rank);
}

// Manga staff mixes authors with translators and editors; keep the creative roles.
const AUTHOR_ROLE = /story|art|original creator/i;

function creatorsOf(raw, kind) {
  if (kind === "anime") return (raw.studios?.nodes ?? []).map((s) => str(s?.name)).filter(Boolean);
  const names = (raw.staff?.edges ?? []).filter((e) => AUTHOR_ROLE.test(str(e?.role))).map((e) => str(e?.node?.name?.full));
  return [...new Set(names.filter(Boolean))];
}

function formatDate(d) {
  if (!d?.year) return "";
  if (!d.month) return String(d.year);
  return new Date(Date.UTC(d.year, d.month - 1, d.day || 1)).toLocaleDateString("en", {
    year: "numeric",
    month: "short",
    ...(d.day ? { day: "numeric" } : {}),
    timeZone: "UTC",
  });
}

function periodOf(start, end) {
  const from = formatDate(start);
  const to = formatDate(end);
  if (!from) return "";
  return to && to !== from ? `${from} to ${to}` : from;
}

export function kindOf(type) {
  return type === "MANGA" ? "manga" : "anime";
}

export function toMedia(raw, kind = kindOf(raw?.type)) {
  const title = raw.title ?? {};
  const english = str(title.english);
  const romaji = str(title.romaji) || english || "Untitled";
  const cover = raw.coverImage ?? {};

  return {
    id: raw.id,
    kind,
    title: english || romaji,
    altTitle: english && english !== romaji ? romaji : "",
    titleNative: str(title.native),
    image: safeUrl(cover.extraLarge) || safeUrl(cover.large),
    banner: safeUrl(raw.bannerImage),
    color: /^#[0-9a-f]{6}$/i.test(str(cover.color)) ? cover.color : "",
    format: labelOf(kind, raw.format) || str(raw.format),
    status: labelOf(kind, raw.status) || str(raw.status),
    score: num(raw.averageScore), // 0–100
    rank: rankOf(raw.rankings, "RATED"),
    popularityRank: rankOf(raw.rankings, "POPULAR"),
    popularity: num(raw.popularity),
    favourites: num(raw.favourites),
    year: num(raw.seasonYear) ?? num(raw.startDate?.year),
    episodes: num(raw.episodes),
    chapters: num(raw.chapters),
    volumes: num(raw.volumes),
    duration: num(raw.duration) ? `${raw.duration} min${raw.episodes === 1 ? "" : " per ep"}` : "",
    period: periodOf(raw.startDate, raw.endDate),
    synopsis: htmlToText(raw.description),
    genres: (raw.genres ?? []).filter((g) => typeof g === "string"),
    creators: creatorsOf(raw, kind),
    trailerUrl: trailerUrl(raw.trailer),
    url: safeUrl(raw.siteUrl),
    recommendations: uniqueById(
      (raw.recommendations?.nodes ?? [])
        .map((n) => n?.mediaRecommendation)
        .filter(Boolean)
        .map((m) => toMedia(m)),
    ),
  };
}

/** Pages can repeat entries when the underlying list shifts between requests. */
export function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => Number.isInteger(item.id) && !seen.has(item.id) && seen.add(item.id));
}
