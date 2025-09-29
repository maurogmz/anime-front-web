import { createElement } from "../utils/helpers.js";

export function SearchBar({ onSearch, placeholder = "Buscar anime, e.j. Naruto" }) {
  const cont = createElement("div",{class:"search"});
  const input = createElement("input", { placeholder });
  const btn = createElement("button", { type:"button" }, ["Buscar"]);

  btn.addEventListener("click", () => {
    onSearch(input.value);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") onSearch(input.value);
  });

  cont.append(input, btn);
  return cont;
}
