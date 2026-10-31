import { describe, it, expect } from "vitest";
import { sanitizeBrowseParams, browseQuery, currentSeason, labelOf } from "./catalog.js";

const p = (qs) => new URLSearchParams(qs);

describe("sanitizeBrowseParams", () => {
  it("keeps whitelisted values", () => {
    expect(sanitizeBrowseParams("anime", p("q=naruto&format=TV&status=RELEASING&genre=Slice of Life&sort=score&page=3"))).toEqual({
      q: "naruto",
      format: "TV",
      status: "RELEASING",
      genre: "Slice of Life",
      sort: "score",
      page: 3,
    });
  });

  it("drops unknown or hostile values", () => {
    const f = sanitizeBrowseParams("manga", p('format=TV&status=airing&genre=") { evil }&sort=__proto__&page=-4'));
    expect(f).toEqual({ q: "", format: "", status: "", genre: "", sort: "popular", page: 1 });
  });

  it("hides adult genres and caps query length", () => {
    expect(sanitizeBrowseParams("anime", p("genre=Hentai")).genre).toBe("");
    expect(sanitizeBrowseParams("anime", p(`q=${"a".repeat(500)}`)).q).toHaveLength(100);
  });
});

describe("browseQuery", () => {
  it("round-trips and omits defaults", () => {
    expect(browseQuery(sanitizeBrowseParams("anime", p("q=one piece&page=2")))).toBe("?q=one+piece&page=2");
    expect(browseQuery(sanitizeBrowseParams("anime", p("")))).toBe("");
  });
});

describe("currentSeason", () => {
  it.each([
    ["2026-01-15", "WINTER"],
    ["2026-04-01", "SPRING"],
    ["2026-09-30", "SUMMER"],
    ["2026-10-31", "FALL"],
  ])("%s → %s", (date, season) => {
    expect(currentSeason(new Date(`${date}T12:00:00`))).toEqual({ season, year: 2026 });
  });
});

describe("labelOf", () => {
  it("labels formats and statuses per kind", () => {
    expect(labelOf("anime", "RELEASING")).toBe("Airing");
    expect(labelOf("manga", "RELEASING")).toBe("Publishing");
    expect(labelOf("manga", "ONE_SHOT")).toBe("One-shot");
    expect(labelOf("anime", "NOPE")).toBe("");
  });
});
