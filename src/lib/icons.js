// Authored 24×24 stroke icons, one weight across the set.
const PATHS = {
  search: "M20 20l-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z",
  heart: "M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z",
  star: "M12 3.6l2.55 5.2 5.75.84-4.15 4.05.98 5.71L12 16.7l-5.13 2.7.98-5.71L3.7 9.64l5.75-.84z",
  chevronLeft: "M15 18l-6-6 6-6",
  chevronRight: "M9 6l6 6-6 6",
  arrowLeft: "M19 12H5M11 18l-6-6 6-6",
  external: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  play: "M8 5.5v13l10.5-6.5z",
  refresh: "M20 12a8 8 0 1 1-2.34-5.66M20 4v4.5h-4.5",
};

const NS = "http://www.w3.org/2000/svg";

export function icon(name, { size = 20, filled = false } = {}) {
  const svg = document.createElementNS(NS, "svg");
  const attrs = {
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: filled ? "currentColor" : "none",
    stroke: "currentColor",
    "stroke-width": "1.75",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "aria-hidden": "true",
    focusable: "false",
    class: "icon",
  };
  for (const [k, v] of Object.entries(attrs)) svg.setAttribute(k, v);
  const path = document.createElementNS(NS, "path");
  path.setAttribute("d", PATHS[name]);
  svg.append(path);
  return svg;
}
