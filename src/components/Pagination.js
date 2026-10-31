import { h } from "../lib/dom.js";
import { icon } from "../lib/icons.js";
import { formatNumber } from "../lib/format.js";

export function Pagination({ page, lastPage, onChange }) {
  if (lastPage <= 1) return h("div");

  const step = (target, label, name) =>
    h(
      "button",
      { type: "button", class: "button button--ghost", disabled: target < 1 || target > lastPage, onClick: () => onChange(target) },
      name === "chevronLeft" && icon(name, { size: 18 }),
      label,
      name === "chevronRight" && icon(name, { size: 18 }),
    );

  return h(
    "nav",
    { class: "pagination", "aria-label": "Pagination" },
    step(page - 1, "Previous", "chevronLeft"),
    h("p", { class: "pagination__status", "aria-live": "polite" }, `Page ${formatNumber(page)} of ${formatNumber(lastPage)}`),
    step(page + 1, "Next", "chevronRight"),
  );
}
