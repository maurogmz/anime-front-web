export function AnimeCard(anime) {
  const card = document.createElement("div");
  card.className = "anime-card";

  card.innerHTML = `
    <img src="${anime.images.jpg.image_url}" alt="${anime.title}" />
    <h3>${anime.title}</h3>
    <p>Score: ${anime.score ?? "N/A"}</p>
    <button data-id="${anime.mal_id}">Ver más</button>
  `;

  card.querySelector("button").addEventListener("click", () => {
    history.pushState({}, "", `/anime/${anime.mal_id}`);
    window.dispatchEvent(new Event("popstate"));
  });

  return card;
}
