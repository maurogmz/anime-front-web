// Favorites store (Observer pattern) persisted in localStorage.
// Stored data is untrusted on read: entries are validated and URLs re-checked.
import { MEDIA_KINDS } from "../config/catalog.js";
import { safeUrl } from "../lib/url.js";

const KEY = "animehub:favorites:v2";
const LEGACY_KEY = "anime_favs_v1"; // v1 format: [[mal_id, { mal_id, title, images, score }]]
const MAX_ITEMS = 500;

const keyOf = (kind, id) => `${kind}:${id}`;

function normalize(item) {
  if (!item || !Number.isInteger(item.id) || item.id <= 0) return null;
  if (!MEDIA_KINDS.includes(item.kind) || typeof item.title !== "string") return null;
  return {
    id: item.id,
    kind: item.kind,
    title: item.title.slice(0, 300),
    image: safeUrl(item.image),
    format: typeof item.format === "string" ? item.format.slice(0, 40) : "",
    score: typeof item.score === "number" ? item.score : null,
    year: Number.isInteger(item.year) ? item.year : null,
  };
}

function migrateLegacy(raw) {
  return JSON.parse(raw).map(([, v]) => ({
    id: v?.mal_id,
    kind: "anime",
    title: v?.title,
    image: v?.images?.jpg?.large_image_url,
    score: v?.score,
  }));
}

function safeStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function createFavoritesStore(storage = safeStorage()) {
  const items = new Map();
  const listeners = new Set();

  function load() {
    try {
      const raw = storage?.getItem(KEY);
      const legacy = raw ? null : storage?.getItem(LEGACY_KEY);
      const list = raw ? JSON.parse(raw) : legacy ? migrateLegacy(legacy) : [];
      if (!Array.isArray(list)) return;
      for (const entry of list.slice(0, MAX_ITEMS)) {
        const item = normalize(entry);
        if (item) items.set(keyOf(item.kind, item.id), item);
      }
      if (legacy) {
        persist();
        storage.removeItem(LEGACY_KEY);
      }
    } catch {
      // corrupt storage: start empty rather than crash
    }
  }

  function persist() {
    try {
      storage?.setItem(KEY, JSON.stringify([...items.values()]));
    } catch {
      // quota or privacy mode: keep in memory
    }
  }

  function notify() {
    for (const fn of listeners) fn();
  }

  load();

  return {
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    has: (kind, id) => items.has(keyOf(kind, id)),
    list: () => [...items.values()].reverse(), // newest first
    get size() {
      return items.size;
    },
    toggle(media) {
      const key = keyOf(media.kind, media.id);
      if (items.has(key)) {
        items.delete(key);
      } else {
        const item = normalize(media);
        if (!item || items.size >= MAX_ITEMS) return false;
        items.set(key, item);
      }
      persist();
      notify();
      return items.has(key);
    },
  };
}

export const favorites = createFavoritesStore();
