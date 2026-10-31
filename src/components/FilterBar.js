import { h } from "../lib/dom.js";
import { icon } from "../lib/icons.js";
import { CATALOG, SORTS } from "../config/catalog.js";
import { getGenres } from "../api/jikan.js";

function Select({ name, label, value, options, placeholder }) {
  const select = h(
    "select",
    { name, id: `filter-${name}` },
    placeholder && h("option", { value: "" }, placeholder),
    options.map(([v, text]) => h("option", { value: v, selected: v === value }, text)),
  );
  return { field: h("div", { class: "field" }, h("label", { for: `filter-${name}` }, label), select), select };
}

/**
 * Search + filters. Text search applies on submit (saves API quota);
 * selects apply on change.
 */
export function FilterBar({ kind, filters, onChange }) {
  const config = CATALOG[kind];
  const input = h("input", {
    type: "search",
    name: "q",
    id: "filter-q",
    value: filters.q,
    placeholder: `Search ${config.label.toLowerCase()} by title`,
    autocomplete: "off",
    maxlength: "100",
    enterkeyhint: "search",
  });

  const format = Select({ name: "format", label: "Format", value: filters.format, options: config.formats, placeholder: "Any format" });
  const status = Select({ name: "status", label: "Status", value: filters.status, options: config.statuses, placeholder: "Any status" });
  const genre = Select({ name: "genre", label: "Genre", value: filters.genre, options: [], placeholder: "Any genre" });
  const sort = Select({
    name: "sort",
    label: "Sort by",
    value: filters.sort,
    options: Object.entries(SORTS).map(([k, s]) => [k, s.label]),
  });

  getGenres(kind)
    .then((list) => {
      genre.select.append(...list.map((g) => h("option", { value: String(g.id), selected: String(g.id) === filters.genre }, g.name)));
    })
    .catch(() => {
      genre.select.disabled = true;
    });

  const read = () => ({
    q: input.value.trim().slice(0, 100),
    format: format.select.value,
    status: status.select.value,
    genre: genre.select.value,
    sort: sort.select.value,
    page: 1,
  });

  for (const { select } of [format, status, genre, sort]) select.addEventListener("change", () => onChange(read()));

  const form = h(
    "form",
    { class: "filters", role: "search", onSubmit: (e) => (e.preventDefault(), onChange(read())) },
    h(
      "div",
      { class: "field field--search" },
      h("label", { for: "filter-q" }, "Title"),
      h(
        "div",
        { class: "search" },
        input,
        h("button", { type: "submit", class: "button button--accent" }, icon("search", { size: 18 }), "Search"),
      ),
    ),
    format.field,
    status.field,
    genre.field,
    sort.field,
  );
  return form;
}
