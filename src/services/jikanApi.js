// Servicio que encapsula llamadas a la API Jikan (v4).
// Es la única parte que toca la red: centraliza errores, timeouts y parseo.
// Podemos ampliar con autenticación / proxy si Jikan limita el CORS.

const BASE = "https://api.jikan.moe/v4";
const TIMEOUT_MS = 15000;

async function fetchWithTimeout(url, opts = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) {
      const text = await res.text().catch(()=>"");
      const err = new Error(`HTTP ${res.status}: ${res.statusText}`);
      err.body = text;
      throw err;
    }
    return res.json();
  } catch (e) {
    if (e.name === "AbortError") throw new Error("Tiempo de espera agotado");
    throw e;
  }
}

export async function searchAnime(q, page = 1, limit = 24) {
  const url = `${BASE}/anime?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`;
  return fetchWithTimeout(url);
}

export async function getAnime(id) {
  const url = `${BASE}/anime/${id}/full`;
  return fetchWithTimeout(url);
}

export async function getTop(type = "anime", page = 1) {
  // type can be anime, manga
  const url = `${BASE}/top/${type}?page=${page}`;
  return fetchWithTimeout(url);
}

export async function getSeason(year, season) {
  // season: winter/spring/summer/fall
  const url = `${BASE}/seasons/${year}/${season}`;
  return fetchWithTimeout(url);
}

export async function getSeasonNow() {
  const url = `${BASE}/seasons/now`;
  return fetchWithTimeout(url);
}

export async function getGenres(type = "anime") {
  // returns list of genres
  const url = `${BASE}/genres/${type}`;
  return fetchWithTimeout(url);
}

export async function getRecommendations(id) {
  const url = `${BASE}/anime/${id}/recommendations`;
  return fetchWithTimeout(url);
}

export async function getCharacters(id) {
  const url = `${BASE}/anime/${id}/characters`;
  return fetchWithTimeout(url);
}

// Exponer más endpoints según necesidad: producers, schedules, themes, etc.
export default {
  searchAnime, getAnime, getTop, getSeasonNow, getSeason, getGenres, getRecommendations, getCharacters
};
