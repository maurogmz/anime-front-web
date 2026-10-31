import { h } from "../lib/dom.js";
import { MediaCard } from "./MediaCard.js";
import { SkeletonGrid, EmptyState, loadInto } from "./StatusView.js";

/** Titled horizontal row of cards that loads its own data. */
export function MediaRail({ title, moreHref, load, cardOptions }) {
  const headingId = `rail-${title.toLowerCase().replace(/\W+/g, "-")}`;
  const body = h("div", { class: "rail__body" });

  loadInto(body, {
    load,
    skeleton: () => SkeletonGrid(8, { rail: true }),
    render: (items) =>
      items.length
        ? h(
            "div",
            { class: "rail__track", tabindex: "0", role: "region", "aria-labelledby": headingId },
            items.map((item) => MediaCard(item, cardOptions)),
          )
        : EmptyState({ title: "Nothing here yet." }),
  });

  return h(
    "section",
    { class: "rail" },
    h(
      "div",
      { class: "rail__head" },
      h("h2", { id: headingId, class: "rail__title" }, title),
      moreHref && h("a", { class: "link", href: moreHref }, "See all"),
    ),
    body,
  );
}
