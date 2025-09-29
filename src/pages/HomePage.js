import { searchAnime } from "../services/jikanApi.js";
import { AnimeCard } from "../components/AnimeCard.js";

export function HomePage() {
  const container = document.createElement("div");

  const input = document.createElement("input");
  input.placeholder = "Buscar anime...";
  const button = document.createElement("button");
  button.textContent = "Buscar";

  const results = document.createElement("div");

  button.addEventListener("click", async () => {
    results.innerHTML = "Cargando...";
    try {
      const data = await searchAnime(input.value);
      results.innerHTML = "";
      data.data.forEach(anime => {
        results.appendChild(AnimeCard(anime));
      });
    } catch (err) {
      results.innerHTML = "Error al cargar resultados";
    }
  });

  container.append(input, button, results);
  return container;
}
