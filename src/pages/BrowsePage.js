import { h, setTitle } from "../lib/dom.js";
import { formatNumber } from "../lib/format.js";
import { href, pushQuery } from "../app/router.js";
import { CATALOG, sanitizeBrowseParams, browseQuery } from "../config/catalog.js";
import { searchMedia } from "../api/anilist.js";
import { FilterBar } from "../components/FilterBar.js";
import { MediaCard } from "../components/MediaCard.js";
import { Pagination } from "../components/Pagination.js";
import { EmptyState, loadInto } from "../components/StatusView.js";

export function BrowsePage({ kind, params }) {
  const config = CATALOG[kind];
  let filters = sanitizeBrowseParams(kind, params);
  setTitle(config.label);

  const summary = h("p", { class: "browse__summary", "aria-live": "polite" });
  const results = h("div", { class: "browse__results" });
  const pager = h("div");

  function update(next, { scroll = false } = {}) {
    filters = next;
    pushQuery(`/browse/${kind}${browseQuery(filters)}`);
    load();
    if (scroll) heading.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  function load() {
    summary.textContent = "Loading…";
    pager.replaceChildren();
    loadInto(results, {
      load: () => searchMedia(kind, filters),
      render: ({ items, page, lastPage, total }) => {
        summary.textContent = total != null ? `${formatNumber(total)} ${total === 1 ? "title" : "titles"}` : "";
        pager.replaceChildren(Pagination({ page, lastPage, onChange: (p) => update({ ...filters, page: p }, { scroll: true }) }));
        if (!items.length) {
          return EmptyState({
            title: "No titles match these filters.",
            body: "Try a shorter search or fewer filters.",
            action: h("a", { class: "button button--ghost", href: href(`/browse/${kind}`) }, "Clear filters"),
          });
        }
        return h(
          "div",
          { class: "grid" },
          items.map((item) => MediaCard(item)),
        );
      },
    }).then(() => {
      if (summary.textContent === "Loading…") summary.textContent = "";
    });
  }

  const other = kind === "anime" ? "manga" : "anime";
  const heading = h("h1", { class: "page-title", tabindex: "-1" }, config.label);

  load();

  return h(
    "div",
    { class: "page container stack" },
    h(
      "div",
      { class: "browse__head" },
      heading,
      h("a", { class: "link", href: href(`/browse/${other}`) }, `Browse ${CATALOG[other].label.toLowerCase()} instead`),
    ),
    FilterBar({ kind, filters, onChange: (next) => update(next) }),
    summary,
    results,
    pager,
  );
}
