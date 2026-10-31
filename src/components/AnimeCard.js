import { createElement, formatScore } from "../utils/helpers.js";
import store from "../store/store.js";
import { routerTo } from "../router.js";

export function AnimeCard(anime) {
  const card = createElement("div",{class:"anime-card"});
  const img = createElement("img", { src: anime.images?.jpg?.large_image_url ?? "/assets/img/placeholder.png", alt: anime.title });
  const body = createElement("div",{class:"card-body"});
  const title = createElement("h3",{class:"card-title"}, [anime.title]);
  const meta = createElement("div",{class:"card-meta"}, [`${anime.type ?? ""}`, `⭐ ${formatScore(anime.score)}`]);

  const actions = createElement("div",{class:"row"});
  const btnView = createElement("button",{class:"pill"}, ["Ver"]);
  const favBtn = createElement("button",{class:"pill"}, [ store.isFavorite(anime.mal_id) ? "Favorito ❤️" : "Guardar" ]);

  btnView.addEventListener("click", () => {
    routerTo(`/anime/${anime.mal_id}`);
  });

  favBtn.addEventListener("click", () => {
    if (store.isFavorite(anime.mal_id)) {
      store.removeFavorite(anime.mal_id);
      favBtn.textContent = "Guardar";
    } else {
      store.addFavorite({ mal_id: anime.mal_id, title: anime.title, images: anime.images, score: anime.score });
      favBtn.textContent = "Favorito ❤️";
    }
  });

  body.append(title, meta, actions);
  actions.append(btnView, favBtn);
  card.append(img, body);
  return card;
}
