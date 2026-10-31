import { h, setTitle } from "../lib/dom.js";
import { icon } from "../lib/icons.js";
import { formatScore, formatNumber, formatRank, formatCompact } from "../lib/format.js";
import { href } from "../app/router.js";
import { CATALOG } from "../config/catalog.js";
import { getMedia, getRecommendations } from "../api/jikan.js";
import { Poster } from "../components/MediaCard.js";
import { FavoriteButton } from "../components/FavoriteButton.js";
import { MediaRail } from "../components/MediaRail.js";
import { loadInto } from "../components/StatusView.js";

function facts(m) {
  const anime = m.kind === "anime";
  return [
    ["Format", m.format],
    [anime ? "Episodes" : "Chapters", formatNumber(anime ? m.episodes : m.chapters)],
    !anime && ["Volumes", formatNumber(m.volumes)],
    ["Status", m.status],
    [anime ? "Aired" : "Published", m.period],
    anime && ["Duration", m.duration],
    [anime ? "Studios" : "Authors", m.creators.map((c) => c.name).join(", ")],
    anime && ["Rating", m.rating],
  ].filter((row) => row && row[1] && row[1] !== "–");
}

function Stats(m) {
  const stat = (label, value, extra) => h("div", { class: "stat" }, h("dt", {}, label), h("dd", {}, value, extra));
  return h(
    "dl",
    { class: "stats" },
    stat("Score", formatScore(m.score), m.scoredBy != null && h("span", { class: "stat__note" }, `${formatCompact(m.scoredBy)} votes`)),
    stat("Ranked", formatRank(m.rank)),
    stat("Popularity", formatRank(m.popularity)),
    stat("Members", formatCompact(m.members)),
  );
}

function Detail(m) {
  setTitle(m.title);
  const external = (url, label, name) =>
    url &&
    h("a", { class: "button button--ghost", href: url, target: "_blank", rel: "noopener noreferrer" }, icon(name, { size: 18 }), label);

  return h(
    "article",
    { class: "detail" },
    h(
      "header",
      { class: "detail__hero" },
      m.image && h("img", { class: "hero__backdrop", src: m.image, alt: "", "aria-hidden": "true", referrerpolicy: "no-referrer" }),
      h(
        "div",
        { class: "container detail__hero-inner" },
        h("div", { class: "detail__poster" }, Poster(m, { eager: true })),
        h(
          "div",
          { class: "detail__heading" },
          h("h1", { class: "detail__title", tabindex: "-1" }, m.title),
          (m.altTitle || m.titleJapanese) &&
            h("p", { class: "detail__alt", lang: "ja" }, [m.altTitle, m.titleJapanese].filter(Boolean).join(" · ")),
          Stats(m),
          h(
            "div",
            { class: "actions" },
            FavoriteButton(m, { variant: "label" }),
            external(m.trailerUrl, "Watch trailer", "play"),
            external(m.url, "MyAnimeList", "external"),
          ),
        ),
      ),
    ),
    h(
      "div",
      { class: "container detail__body" },
      h(
        "section",
        { class: "detail__synopsis", "aria-labelledby": "synopsis-title" },
        h("h2", { id: "synopsis-title" }, "Synopsis"),
        m.synopsis ? m.synopsis.split(/\n\s*\n/).map((p) => h("p", {}, p)) : h("p", { class: "muted" }, "No synopsis yet."),
        m.genres.length > 0 &&
          h(
            "ul",
            { class: "tags", "aria-label": "Genres and themes" },
            m.genres.map((g) => h("li", {}, h("a", { class: "tag", href: href(`/browse/${m.kind}?genre=${g.id}`) }, g.name))),
          ),
      ),
      h(
        "aside",
        { class: "detail__facts", "aria-label": "Details" },
        h(
          "dl",
          {},
          facts(m).map(([k, v]) => [h("dt", {}, k), h("dd", {}, v)]),
        ),
      ),
    ),
    h(
      "div",
      { class: "container" },
      MediaRail({
        title: "If you liked this",
        load: async () =>
          (await getRecommendations(m.kind, m.id)).slice(0, 15).map((r) => ({ ...r, kind: m.kind, format: "", year: null, score: null })),
        cardOptions: { showFavorite: false },
      }),
    ),
  );
}

export function DetailPage({ kind, id }) {
  setTitle(CATALOG[kind].label);
  const root = h("div", { class: "page" });

  loadInto(root, {
    load: () => getMedia(kind, id),
    skeleton: () =>
      h(
        "div",
        { class: "container detail__hero-inner", "aria-hidden": "true" },
        h("div", { class: "detail__poster" }, h("div", { class: "poster skeleton" })),
        h(
          "div",
          { class: "detail__heading" },
          h("div", { class: "skeleton skeleton--title" }),
          h("div", { class: "skeleton skeleton--line" }),
        ),
      ),
    render: Detail,
  });

  return h(
    "div",
    {},
    h(
      "div",
      { class: "container back" },
      h("a", { class: "link", href: href(`/browse/${kind}`) }, icon("arrowLeft", { size: 16 }), `All ${CATALOG[kind].label.toLowerCase()}`),
    ),
    root,
  );
}
