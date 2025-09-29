const API_BASE = "https://api.jikan.moe/v4";

export async function searchAnime(query) {
  const res = await fetch(`${API_BASE}/anime?q=${query}`);
  if (!res.ok) throw new Error("Error al buscar animes");
  return res.json();
}

export async function getAnime(id) {
  const res = await fetch(`${API_BASE}/anime/${id}`);
  if (!res.ok) throw new Error("Error al obtener anime");
  return res.json();
}
