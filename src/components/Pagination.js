import { createElement } from "../utils/helpers.js";

export function Pagination({ page=1, last=1, onChange }) {
  const cont = createElement("div",{class:"pagination"});
  const prev = createElement("button",{class:"pill"}, ["◀"]);
  const next = createElement("button",{class:"pill"}, ["▶"]);

  prev.disabled = page <= 1;
  next.disabled = page >= last;

  prev.addEventListener("click", () => onChange(Math.max(1, page-1)));
  next.addEventListener("click", () => onChange(Math.min(last, page+1)));

  cont.append(prev, createElement("div", {class:"muted"}, [`Página ${page} / ${last}`]), next);
  return cont;
}
