// utilidades pequeñas usadas por varios módulos

export function formatScore(score) {
  if (!score && score !== 0) return "N/A";
  return Number(score).toFixed(2);
}

export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)) {
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else el.setAttribute(k, v);
  }
  if (Array.isArray(children)) children.forEach(c => {
    if (typeof c === "string") el.appendChild(document.createTextNode(c));
    else if (c) el.appendChild(c);
  });
  return el;
}

export function parseQuery(queryString) {
  return Object.fromEntries(new URLSearchParams(queryString));
}
