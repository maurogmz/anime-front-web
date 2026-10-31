import { h, setTitle } from "../lib/dom.js";
import { href } from "../app/router.js";

export function NotFoundPage() {
  setTitle("Not found");
  return h(
    "div",
    { class: "page container stack" },
    h("h1", { class: "page-title", tabindex: "-1" }, "This page doesn't exist"),
    h("p", { class: "muted" }, "The link may be broken or the title was removed."),
    h("p", {}, h("a", { class: "button button--accent", href: href("/") }, "Go home")),
  );
}
