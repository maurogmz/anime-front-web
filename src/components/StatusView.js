// Loading, empty and error states shared by every data view.
import { h } from "../lib/dom.js";
import { icon } from "../lib/icons.js";

export function SkeletonGrid(count = 12, { rail = false } = {}) {
  return h(
    "div",
    { class: rail ? "rail__track" : "grid", "aria-hidden": "true" },
    Array.from({ length: count }, () =>
      h("div", { class: "card card--skeleton" }, h("div", { class: "poster skeleton" }), h("div", { class: "skeleton skeleton--line" })),
    ),
  );
}

export function EmptyState({ title, body, action }) {
  return h(
    "div",
    { class: "state", role: "status" },
    h("p", { class: "state__title" }, title),
    body && h("p", { class: "state__body" }, body),
    action,
  );
}

export function ErrorState(error, onRetry) {
  return h(
    "div",
    { class: "state state--error", role: "alert" },
    h("p", { class: "state__title" }, "Something went wrong"),
    h("p", { class: "state__body" }, error?.message || "Unexpected error."),
    onRetry && h("button", { type: "button", class: "button button--ghost", onClick: onRetry }, icon("refresh", { size: 18 }), "Try again"),
  );
}

/**
 * Renders loading → content | error into `container`, retry included.
 * Skips the update if the user already navigated away (container detached).
 */
export async function loadInto(container, { load, render, skeleton = () => SkeletonGrid() }) {
  container.setAttribute("aria-busy", "true");
  container.replaceChildren(skeleton());
  try {
    const data = await load();
    if (container.isConnected) container.replaceChildren(render(data));
  } catch (error) {
    if (container.isConnected) container.replaceChildren(ErrorState(error, () => loadInto(container, { load, render, skeleton })));
  } finally {
    container.removeAttribute("aria-busy");
  }
}
