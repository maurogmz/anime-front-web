import { safeUrl } from "./url.js";

/**
 * Hyperscript-style element factory. Children are appended as nodes or text,
 * never parsed as HTML, so API data cannot inject markup.
 *
 * h("a", { class: "link", href: "#/anime/1", onClick: fn }, "Title")
 */
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(props ?? {})) {
    if (value == null || value === false) continue;

    if (key === "class") {
      el.className = value;
    } else if (key.startsWith("on")) {
      // Inline handler strings are never set; only real listeners.
      if (typeof value === "function") el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === "href" || key === "src") {
      const safe = String(value).startsWith("#") ? value : safeUrl(value);
      if (safe) el.setAttribute(key, safe);
    } else {
      el.setAttribute(key, value === true ? "" : value);
    }
  }

  el.append(...children.flat(Infinity).filter((c) => c != null && c !== false));
  return el;
}

export function setTitle(title) {
  document.title = title ? `${title} · Anime Hub` : "Anime Hub";
}
