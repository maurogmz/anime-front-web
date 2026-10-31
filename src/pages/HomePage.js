import { h, setTitle } from "../lib/dom.js";
import { icon } from "../lib/icons.js";
import { formatScore } from "../lib/format.js";
import { href } from "../app/router.js";
import { getHome } from "../api/anilist.js";
import { MediaRail } from "../components/MediaRail.js";
import { Poster } from "../components/MediaCard.js";
import { FavoriteButton } from "../components/FavoriteButton.js";
import { loadInto } from "../components/StatusView.js";

// One GraphQL request feeds the hero and all three rails (the client dedupes and caches it).
const home = () => getHome();

function Hero(media) {
  const facts = ["Top rated this season", media.format, media.episodes && `${media.episodes} episodes`, media.studio].filter(Boolean);
  return h(
    "div",
    { class: "hero__inner" },
    (media.banner || media.image) &&
      h("img", {
        class: media.banner ? "hero__backdrop hero__backdrop--banner" : "hero__backdrop",
        src: media.banner || media.image,
        alt: "",
        "aria-hidden": "true",
        referrerpolicy: "no-referrer",
      }),
    h(
      "a",
      { class: "hero__poster", href: href(`/anime/${media.id}`), tabindex: "-1", "aria-hidden": "true" },
      Poster(media, { eager: true }),
    ),
    h(
      "div",
      { class: "hero__copy" },
      h("h1", { class: "hero__title" }, media.title),
      h(
        "p",
        { class: "hero__facts" },
        media.score != null && h("span", { class: "score score--lg" }, icon("star", { size: 18, filled: true }), formatScore(media.score)),
        facts.join(" · "),
      ),
      media.synopsis && h("p", { class: "hero__synopsis" }, media.synopsis),
      h(
        "div",
        { class: "actions" },
        h("a", { class: "button button--accent", href: href(`/anime/${media.id}`) }, "View details"),
        FavoriteButton(media, { variant: "label" }),
      ),
    ),
  );
}

function QuickSearch() {
  const input = h("input", {
    type: "search",
    name: "q",
    placeholder: "Search a title, like Frieren or Berserk",
    autocomplete: "off",
    maxlength: "100",
    "aria-label": "Title",
  });
  const kind = h(
    "select",
    { name: "kind", "aria-label": "Search in" },
    h("option", { value: "anime" }, "Anime"),
    h("option", { value: "manga" }, "Manga"),
  );
  return h(
    "form",
    {
      class: "quick-search",
      role: "search",
      onSubmit: (e) => {
        e.preventDefault();
        const q = input.value.trim().slice(0, 100);
        location.hash = `/browse/${kind.value}${q ? `?q=${encodeURIComponent(q)}` : ""}`;
      },
    },
    h(
      "div",
      { class: "search" },
      kind,
      input,
      h("button", { type: "submit", class: "button button--accent" }, icon("search", { size: 18 }), "Search"),
    ),
  );
}

export function HomePage() {
  setTitle("");
  const hero = h("section", { class: "hero", "aria-label": "Featured" });

  loadInto(hero, {
    load: home,
    skeleton: () => h("div", { class: "hero__inner hero__inner--loading", "aria-hidden": "true" }, h("div", { class: "poster skeleton" })),
    render: ({ season }) => {
      const featured = season.filter((m) => m.image).sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
      return featured ? Hero({ ...featured, studio: featured.creators[0] }) : h("h1", { class: "container page-title" }, "Anime Hub");
    },
  });

  return h(
    "div",
    { class: "page page--home" },
    hero,
    h(
      "div",
      { class: "container stack" },
      QuickSearch(),
      MediaRail({ title: "Airing this season", moreHref: href("/browse/anime?status=RELEASING"), load: async () => (await home()).season }),
      MediaRail({
        title: "Top anime of all time",
        moreHref: href("/browse/anime?sort=score"),
        load: async () => (await home()).topAnime,
      }),
      MediaRail({
        title: "Top manga of all time",
        moreHref: href("/browse/manga?sort=score"),
        load: async () => (await home()).topManga,
      }),
    ),
  );
}
