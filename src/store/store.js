// Un store ligero con patrón Observer para manejar estado global (favorites, cache).
// Permite subscripción (componentes se actualizan automáticamente).

const state = {
  favorites: new Map(), // mal_id -> animeData
  cache: new Map()      // key -> response
};

const listeners = new Set();

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function notify() { listeners.forEach(fn => { try { fn(state); } catch(e){} }); }

export function addFavorite(anime) {
  if (!anime || !anime.mal_id) return;
  state.favorites.set(anime.mal_id, anime);
  persistFavorites();
  notify();
}

export function removeFavorite(mal_id) {
  state.favorites.delete(mal_id);
  persistFavorites();
  notify();
}

export function isFavorite(mal_id) {
  return state.favorites.has(mal_id);
}

export function listFavorites() {
  return Array.from(state.favorites.values());
}

export function cacheSet(key, value) {
  state.cache.set(key, { value, ts: Date.now() });
}

export function cacheGet(key) {
  const item = state.cache.get(key);
  if (!item) return null;
  // opcional: invalidar cache después de X minutos
  return item.value;
}

function persistFavorites() {
  try {
    const arr = Array.from(state.favorites.entries());
    localStorage.setItem("anime_favs_v1", JSON.stringify(arr));
  } catch (e) {}
}

function loadFavorites() {
  try {
    const raw = localStorage.getItem("anime_favs_v1");
    if (!raw) return;
    const arr = JSON.parse(raw);
    state.favorites = new Map(arr);
  } catch (e) {}
}

loadFavorites();

export default {
  subscribe, addFavorite, removeFavorite, isFavorite, listFavorites, cacheGet, cacheSet
};
