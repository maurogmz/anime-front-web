import { Navbar } from "../components/Navbar.js";
import { SearchBar } from "../components/SearchBar.js";
import { AnimeCard } from "../components/AnimeCard.js";
import { Pagination } from "../components/Pagination.js";
import jikan from "../services/jikanApi.js";
import store from "../store/store.js";
import { createElement } from "../utils/helpers.js";

export function HomePage() {
  const root = createElement("div",{class:"app-container content"});
  const nav = Navbar();
  const search = SearchBar({ onSearch: handleSearch });
  const results = createElement("div",{class:"grid"});
  const bottom = createElement("div",{});

  let currentPage = 1;
  let lastPage = 1;
  let currentQuery = "";

  async function handleSearch(q){
    if (!q || !q.trim()) return;
    currentQuery = q.trim();
    currentPage = 1;
    await loadResults();
  }

  async function loadResults(){
    results.innerHTML = "";
    for (let i=0;i<6;i++) {
      const sk = createElement("div",{class:"skeleton"}, []);
      sk.style.height = "320px";
      results.appendChild(sk);
    }
    try {
      const res = await jikan.searchAnime(currentQuery, currentPage, 24);
      results.innerHTML = "";
      const arr = res.data || [];
      lastPage = res.pagination?.last_visible_page ?? 1;
      if (arr.length === 0) {
        results.appendChild(createElement("div",{},["No se encontraron resultados."]));
      } else {
        arr.forEach(a => results.appendChild(AnimeCard(a)));
      }
      bottom.innerHTML = "";
      bottom.appendChild(Pagination({ page: currentPage, last: lastPage, onChange: async (p) => {
        currentPage = p; await loadResults();
      }}));
    } catch (e) {
      results.innerHTML = "";
      results.appendChild(createElement("div",{},["Error al cargar resultados: " + e.message]));
    }
  }

  (async function init() {
    const wrapper = createElement("div",{},[]);
    wrapper.append(createElement("h2",{},["Tendencias"]));
    const topGrid = createElement("div",{class:"grid"});
    try {
      const res = await jikan.getTop("anime",1);
      (res.data || []).slice(0,12).forEach(a => topGrid.appendChild(AnimeCard(a)));
    } catch(e){
      topGrid.appendChild(createElement("div",{},["No se pudieron cargar tendencias."]));
    }
    wrapper.appendChild(topGrid);
    root.append(nav, search, wrapper, createElement("h3",{},["Resultados"]), results, bottom);
  })();

  return root;
}
