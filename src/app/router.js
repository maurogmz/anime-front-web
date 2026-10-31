// Hash router: GitHub Pages serves static files only, so deep links like
// /anime-front-web/anime/1 would 404 on reload. #/anime/1 always resolves.
import { MEDIA_KINDS } from "../config/catalog.js";

export function matchRoute(hash) {
  const raw = (hash ?? "").replace(/^#/, "") || "/";
  const [path, query = ""] = raw.split("?");
  const params = new URLSearchParams(query);
  const [first, second, ...rest] = path.split("/").filter(Boolean);

  if (!first) return { name: "home", params };
  if (first === "favorites" && !second) return { name: "favorites", params };
  if (first === "browse" && MEDIA_KINDS.includes(second) && !rest.length) {
    return { name: "browse", kind: second, params };
  }
  if (MEDIA_KINDS.includes(first) && /^\d{1,9}$/.test(second ?? "") && !rest.length) {
    return { name: "detail", kind: first, id: Number(second), params };
  }
  return { name: "notFound", params, path };
}

export function href(path) {
  return `#${path}`;
}

/** Update the URL without re-rendering (filters, pagination). Back button still works. */
export function pushQuery(path) {
  history.pushState(null, "", href(path));
  current = location.hash;
}

let current = null;

export function startRouter({ outlet, pages, onRoute }) {
  // Fragment navigation fires both popstate and hashchange; render once per URL.
  function render() {
    if (location.hash === current) return;
    current = location.hash;
    const route = matchRoute(location.hash);
    const page = pages[route.name] ?? pages.notFound;
    outlet.replaceChildren(page(route));
    onRoute?.(route);
  }
  window.addEventListener("hashchange", render);
  window.addEventListener("popstate", render);
  render();
}
