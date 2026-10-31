import { HomePage } from "./pages/HomePage.js";
import { DetailPage } from "./pages/DetailPage.js";

export function router(path) {
  const app = document.getElementById("app");
  app.innerHTML = "";
  if (path === "/" || path === "" || path.startsWith("/?") ) {
    app.appendChild(HomePage());
    return;
  }
  // /anime/123
  if (/^\/anime\/\d+/.test(path)) {
    app.appendChild(DetailPage());
    return;
  }
  // default 404
  const el = document.createElement("div");
  el.className = "content";
  el.innerHTML = `<h2>404 · Página no encontrada</h2><p class="muted">La ruta ${path} no existe.</p>`;
  app.appendChild(el);
}

export function routerTo(path) {
  history.pushState({}, "", path);
  window.dispatchEvent(new Event("popstate"));
}
