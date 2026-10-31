import "@fontsource-variable/fraunces";
import "@fontsource-variable/instrument-sans";
import "./styles/index.css";

import { h } from "./lib/dom.js";
import { startRouter } from "./app/router.js";
import { Header, Footer } from "./components/Header.js";
import { HomePage } from "./pages/HomePage.js";
import { BrowsePage } from "./pages/BrowsePage.js";
import { DetailPage } from "./pages/DetailPage.js";
import { FavoritesPage } from "./pages/FavoritesPage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";

const header = Header();
const main = h("main", { id: "main", tabindex: "-1" });

document
  .getElementById("app")
  .replaceChildren(
    h("a", { class: "skip-link", href: "#main", onClick: (e) => (e.preventDefault(), main.focus()) }, "Skip to content"),
    header.el,
    main,
    Footer(),
  );

let firstRender = true;

startRouter({
  outlet: main,
  pages: {
    home: HomePage,
    browse: BrowsePage,
    detail: DetailPage,
    favorites: FavoritesPage,
    notFound: NotFoundPage,
  },
  onRoute(route) {
    header.setActive(route);
    if (firstRender) {
      firstRender = false;
      return;
    }
    window.scrollTo(0, 0);
    // Move focus to the new page so screen readers announce the change.
    (main.querySelector("h1[tabindex]") ?? main).focus({ preventScroll: true });
  },
});
