const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat("en");

// AniList scores are 0–100; shown as a percentage like on AniList itself.
export const formatScore = (score) => (typeof score === "number" ? `${score}%` : "–");
export const formatCompact = (n) => (typeof n === "number" ? compact.format(n) : "–");
export const formatNumber = (n) => (typeof n === "number" ? whole.format(n) : "–");
export const formatRank = (n) => (typeof n === "number" ? `#${whole.format(n)}` : "–");

export function capitalize(text = "") {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
