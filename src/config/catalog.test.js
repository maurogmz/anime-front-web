import { describe, it, expect } from "vitest";
import { sanitizeBrowseParams, browseQuery } from "./catalog.js";

const p = (qs) => new URLSearchParams(qs);

describe("sanitizeBrowseParams", () => {
  it("keeps whitelisted values", () => {
    expect(sanitizeBrowseParams("anime", p("q=naruto&format=tv&status=airing&genre=1&sort=score&page=3"))).toEqual({
      q: "naruto",
      format: "tv",
      status: "airing",
      genre: "1",
      sort: "score",
      page: 3,
    });
  });

  it("drops unknown or hostile values", () => {
    const f = sanitizeBrowseParams("manga", p("format=tv&status=airing&genre=1;drop&sort=__proto__&page=-4"));
    expect(f).toEqual({ q: "", format: "", status: "", genre: "", sort: "popular", page: 1 });
  });

  it("caps query length", () => {
    expect(sanitizeBrowseParams("anime", p(`q=${"a".repeat(500)}`)).q).toHaveLength(100);
  });
});

describe("browseQuery", () => {
  it("round-trips and omits defaults", () => {
    const f = sanitizeBrowseParams("anime", p("q=one piece&page=2"));
    expect(browseQuery(f)).toBe("?q=one+piece&page=2");
    expect(browseQuery(sanitizeBrowseParams("anime", p("")))).toBe("");
  });
});
