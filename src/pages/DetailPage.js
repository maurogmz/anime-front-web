import { Navbar } from "../components/Navbar.js";
import jikan from "../services/jikanApi.js";
import { createElement } from "../utils/helpers.js";
import { AnimeCard } from "../components/AnimeCard.js";
import { Modal } from "../components/Modal.js";

export function DetailPage() {
  const root = createElement("div",{class:"app-container content"});
  root.appendChild(Navbar());
  const container = createElement("div",{});
  root.append(container);

  const path = window.location.pathname;
  const idMatch = path.match(/\/anime\/(\d+)/);
  const id = idMatch ? idMatch[1] : null;
  if (!id) {
    container.appendChild(createElement("h2",{},["Id de anime inválido"]));
    return root;
  }

  const loading = createElement("div",{},["Cargando..."]);
  container.appendChild(loading);

  (async function load() {
    try {
      const res = await jikan.getAnime(id);
      const data = res.data;

      container.innerHTML = "";
      const header = createElement("div",{class:"row"},[]);
      const poster = createElement("img",{src: data.images.jpg.large_image_url, alt:data.title});
      poster.style.width = "220px"; poster.style.borderRadius = "10px";
      const meta = createElement("div",{style:"padding-left:12px;max-width:700px;"},[]);
      meta.appendChild(createElement("h2",{},[data.title]));
      meta.appendChild(createElement("div",{class:"muted"},[data.title_english || ""]));
      meta.appendChild(createElement("p",{},[data.synopsis ?? "Sin sinopsis"]));
      header.append(poster, meta);

      const recTitle = createElement("h3",{},["Recomendaciones"]);
      const recGrid = createElement("div",{class:"grid"});
      try {
        const rec = await jikan.getRecommendations(id);
        (rec.data || []).slice(0,8).forEach(r => {
          recGrid.appendChild(AnimeCard({ mal_id: r.entry.mal_id, title: r.entry.title, images: { jpg: { large_image_url: r.entry.images?.jpg?.large_image_url || "/assets/img/placeholder.png" } }, score: "N/A" }));
        });
      } catch(e){
        recGrid.appendChild(createElement("div",{},["No hay recomendaciones disponibles."]));
      }

      container.append(header, recTitle, recGrid);
    } catch (e) {
      container.innerHTML = "";
      container.appendChild(createElement("div",{},["Error al cargar anime: " + e.message]));
    }
  })();

  return root;
}
