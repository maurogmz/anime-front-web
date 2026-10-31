// Only https URLs from API data reach the DOM; anything else (javascript:, data:, http:) is dropped.
export function safeUrl(value) {
  if (typeof value !== "string" || !value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}
