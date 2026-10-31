import { h } from "../lib/dom.js";
import { icon } from "../lib/icons.js";
import { formatScore } from "../lib/format.js";
import { href } from "../app/router.js";
import { FavoriteButton } from "./FavoriteButton.js";

export function Poster({ image, title }, { eager = false } = {}) {
  const fallback = () => h("div", { class: "poster poster--empty", "aria-hidden": "true" }, title.charAt(0));
  if (!image) return fallback();

  const img = h("img", {
    class: "poster",
    src: image,
    alt: "",
    width: 225,
    height: 320,
    loading: eager ? "eager" : "lazy",
    decoding: "async",
    referrerpolicy: "no-referrer",
  });
  img.addEventListener("error", () => img.replaceWith(fallback()), { once: true });
  return img;
}

/** Poster card. The whole card is one link; the favorite toggle sits beside it, not inside. */
export function MediaCard(media, { showFavorite = true } = {}) {
  const meta = [media.format, media.year].filter(Boolean).join(" · ");

  return h(
    "article",
    { class: "card" },
    h(
      "a",
      { class: "card__link", href: href(`/${media.kind}/${media.id}`) },
      h("div", { class: "card__media" }, Poster(media)),
      h("h3", { class: "card__title" }, media.title),
    ),
    h(
      "p",
      { class: "card__meta" },
      h("span", {}, meta),
      media.score != null &&
        h(
          "span",
          { class: "score" },
          icon("star", { size: 14, filled: true }),
          h("span", { class: "sr-only" }, "Score "),
          formatScore(media.score),
        ),
    ),
    showFavorite && FavoriteButton(media),
  );
}
