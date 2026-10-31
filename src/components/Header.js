import { h } from "../lib/dom.js";
import { href } from "../app/router.js";
import { favorites } from "../state/favorites.js";

const LINKS = [
  { key: "home", label: "Home", path: "/" },
  { key: "anime", label: "Anime", path: "/browse/anime" },
  { key: "manga", label: "Manga", path: "/browse/manga" },
  { key: "favorites", label: "Favorites", path: "/favorites" },
];

function activeKey(route) {
  if (route.name === "browse" || route.name === "detail") return route.kind;
  return route.name;
}

/** Site header. Returns the element plus `setActive(route)` for the router. */
export function Header() {
  const count = h("span", { class: "nav__count" });
  const links = LINKS.map((link) =>
    h("a", { class: "nav__link", href: href(link.path), "data-key": link.key }, link.label, link.key === "favorites" && count),
  );

  const paintCount = () => {
    count.textContent = favorites.size ? String(favorites.size) : "";
    count.hidden = !favorites.size;
  };
  favorites.subscribe(paintCount);
  paintCount();

  const el = h(
    "header",
    { class: "site-header" },
    h(
      "div",
      { class: "container site-header__inner" },
      h("a", { class: "wordmark", href: href("/") }, "Anime", h("em", {}, "Hub")),
      h("nav", { class: "nav", "aria-label": "Main" }, links),
    ),
  );

  function setActive(route) {
    const key = activeKey(route);
    for (const link of links) {
      if (link.dataset.key === key) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
  }

  return { el, setActive };
}

export function Footer() {
  return h(
    "footer",
    { class: "site-footer" },
    h(
      "div",
      { class: "container" },
      h(
        "p",
        {},
        "Data from ",
        h("a", { class: "link", href: "https://jikan.moe", rel: "noopener noreferrer", target: "_blank" }, "Jikan"),
        ", the unofficial MyAnimeList API. Anime Hub is not affiliated with MyAnimeList.",
      ),
    ),
  );
}
