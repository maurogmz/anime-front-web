import { h } from "../lib/dom.js";
import { icon } from "../lib/icons.js";
import { favorites } from "../state/favorites.js";

/** Toggle button; `variant: "icon"` for cards, `"label"` for the detail page. */
export function FavoriteButton(media, { variant = "icon" } = {}) {
  const button = h("button", { type: "button", class: `fav fav--${variant}` });

  function paint() {
    const saved = favorites.has(media.kind, media.id);
    button.setAttribute("aria-pressed", String(saved));
    button.setAttribute("aria-label", saved ? `Remove ${media.title} from favorites` : `Save ${media.title} to favorites`);
    button.replaceChildren(icon("heart", { size: variant === "icon" ? 18 : 20, filled: saved }));
    if (variant === "label") button.append(saved ? "Saved" : "Save");
  }

  button.addEventListener("click", (event) => {
    event.preventDefault();
    favorites.toggle(media);
    paint();
  });

  paint();
  return button;
}
