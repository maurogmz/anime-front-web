import { HomePage } from "./pages/HomePage.js";
import { DetailPage } from "./pages/DetailPage.js";

/**
 * Obtiene la ruta actual limpia, eliminando el BASE_URL de Vite.
 */
function getCleanPath() {
  const base = import.meta.env.BASE_URL; // "/anime-front-web/" en GitHub Pages
  let path = window.location.pathname;

  // Si la app se deploya en subcarpeta, removemos ese prefijo
  if (path.startsWith(base)) {
    path = path.slice(base.length - 1); // queda como "/"
  }

  return path || "/";
}

/**
 * Router principal de la aplicación.
 */
export function router() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const path = getCleanPath();

  if (path === "/" || path === "" || path.startsWith("/?")) {
    app.appendChild(HomePage());
    return;
  }

  // /anime/123
  if (/^\/anime\/\d+/.test(path)) {
    app.appendChild(DetailPage());
    return;
  }

  // Default 404
  const el = document.createElement("div");
  el.className = "content";
  el.innerHTML = `
    <h2>404 · Página no encontrada</h2>
    <p class="muted">La ruta <code>${path}</code> no existe.</p>
  `;
  app.appendChild(el);
}

/**
 * Navegación programática (pushState).
 */
export function routerTo(path) {
  const base = import.meta.env.BASE_URL;
  const newUrl = base + path.replace(/^\//, "");
  history.pushState({}, "", newUrl);
  window.dispatchEvent(new Event("popstate"));
}
