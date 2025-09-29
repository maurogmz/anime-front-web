import { createElement } from "../utils/helpers.js";
import { routerTo } from "../router.js";

export function Navbar() {
  const nav = createElement("div",{class:"navbar"});
  const brand = createElement("div",{class:"brand"});
  const logo = createElement("div",{class:"logo"}, ["AH"]);
  const title = createElement("div",{class:"title"}, ["Anime Hub"]);
  brand.append(logo, title);

  const actions = createElement("div",{class:"nav-actions"});
  const btnHome = createElement("button",{class:"pill"}, ["Home"]);
  const btnFavs = createElement("button",{class:"pill"}, ["Favoritos"]);

  btnHome.addEventListener("click", (e) => {
    e.preventDefault(); routerTo("/");
  });
  btnFavs.addEventListener("click", (e) => {
    e.preventDefault(); routerTo("/?view=favs");
  });

  actions.append(btnHome, btnFavs);
  nav.append(brand, actions);
  return nav;
}
