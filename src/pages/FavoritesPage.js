import { h, setTitle } from "../lib/dom.js";
import { href } from "../app/router.js";
import { favorites } from "../state/favorites.js";
import { MediaCard } from "../components/MediaCard.js";
import { EmptyState } from "../components/StatusView.js";

const TABS = [
  ["all", "All"],
  ["anime", "Anime"],
  ["manga", "Manga"],
];

export function FavoritesPage({ params }) {
  setTitle("Favorites");
  let tab = TABS.some(([k]) => k === params.get("type")) ? params.get("type") : "all";
  const list = h("div");
  const tabs = h("div", { class: "segmented", role: "group", "aria-label": "Filter favorites" });

  function render() {
    const items = favorites.list().filter((f) => tab === "all" || f.kind === tab);
    tabs.replaceChildren(
      ...TABS.map(([key, label]) =>
        h(
          "button",
          {
            type: "button",
            class: "segmented__item",
            "aria-pressed": String(key === tab),
            onClick: () => {
              tab = key;
              render();
            },
          },
          label,
        ),
      ),
    );
    list.replaceChildren(
      items.length
        ? h(
            "div",
            { class: "grid" },
            items.map((item) => MediaCard(item)),
          )
        : EmptyState({
            title: favorites.size ? "No saved titles of this kind." : "Nothing saved yet.",
            body: "Tap the heart on any title to keep it here. Favorites stay in this browser.",
            action: h("a", { class: "button button--accent", href: href("/browse/anime") }, "Browse anime"),
          }),
    );
  }

  // Re-render when a card's heart removes an item; stop listening once the page is gone.
  const unsubscribe = favorites.subscribe(() => (list.isConnected ? render() : unsubscribe()));
  render();

  return h(
    "div",
    { class: "page container stack" },
    h("div", { class: "browse__head" }, h("h1", { class: "page-title", tabindex: "-1" }, "Favorites"), tabs),
    list,
  );
}
